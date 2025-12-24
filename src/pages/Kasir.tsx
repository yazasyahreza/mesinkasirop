import { useState, useRef, useEffect } from "react";
import { Product, CartItem } from "../types";

// --- IKON UNTUK NOTIFIKASI ---
const Icons = {
  Alert: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Check: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

interface KasirProps {
  products: Product[];
  onSuccess: () => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  pay: string;
  setPay: (val: string) => void;
}

export default function Kasir({
  products,
  onSuccess,
  cart,
  setCart,
  pay,
  setPay,
}: KasirProps) {
  const [scan, setScan] = useState("");

  // State Notifikasi (Toast)
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    show: false,
    msg: "",
    type: "success",
  });

  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => scanRef.current?.focus(), 100);
  }, []);

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  // Helper Notifikasi
  const showNotification = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- LOGIKA MENAMBAH ITEM ---
  const handleAddItem = (barcode: string) => {
    const p = products.find((i) => i.barcode === barcode);
    if (!p) return false;

    const exist = cart.find((c) => c.id === p.id);
    const currentQty = exist ? Number(exist.qty) : 0;

    if (currentQty + 1 > p.stock) {
      showNotification(`Stok habis! Sisa: ${p.stock}`, "error");
      return true;
    }

    if (exist) {
      setCart(
        cart.map((c) => (c.id === p.id ? { ...c, qty: Number(c.qty) + 1 } : c))
      );
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
    return true;
  };

  const handleScanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScan(e.target.value);
  };

  // --- [UTAMA] DELAY SCANNING ---
  useEffect(() => {
    if (!scan) return;

    // Cek apakah kode yang diketik valid
    const found = products.find((p) => p.barcode === scan);

    if (found) {
      // Jika VALID: Tunggu 500ms (setengah detik) agar User sempat melihat kodenya
      // Baru masukkan ke keranjang
      const timer = setTimeout(() => {
        handleAddItem(scan);
        setScan(""); // Bersihkan input setelah delay selesai
      }, 500); // <-- ATUR DURASI JEDA DISINI

      return () => clearTimeout(timer);
    }
  }, [scan, products, cart]);

  // --- [FIX] LOGIKA ENTER MANUAL ---
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman
    if (!scan) return;

    // Cek apakah barang ada
    const found = products.find((p) => p.barcode === scan);

    if (found) {
      // [PENTING] Jika barang DITEMUKAN, JANGAN LAKUKAN APA-APA DI SINI.
      // Biarkan useEffect di atas yang menangani penambahan barang setelah delay 500ms.
      // Ini mencegah "Enter" memotong proses delay.
      return;
    } else {
      // Jika barang TIDAK DITEMUKAN, baru kita yang handle errornya
      showNotification("Barang tidak ditemukan!", "error");
      setScan("");
    }
  };

  const handleQtyChange = (id: number, val: string) => {
    if (val === "") {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty: "" } : c)));
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty: num } : c)));
    }
  };

  const handleQtyBlur = (id: number) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    let finalQty = Number(item.qty);
    if (item.qty === "" || finalQty < 1) finalQty = 1;
    if (finalQty > item.stock) {
      showNotification(`Stok terbatas. Max: ${item.stock}`, "error");
      finalQty = item.stock;
    }
    setCart(cart.map((c) => (c.id === id ? { ...c, qty: finalQty } : c)));
  };

  const handleCheckout = async () => {
    const cleanCart = cart.map((c) => ({ ...c, qty: Number(c.qty) || 1 }));
    const totalCalc = cleanCart.reduce((a, b) => a + b.price * b.qty, 0);
    const money = Number(pay.replace(/\D/g, ""));

    if (money < totalCalc) {
      showNotification("Uang pembayaran kurang!", "error");
      return;
    }

    // @ts-ignore
    const isConfirmed = await window.api.confirmPayment({
      total: formatRp(totalCalc),
      bayar: formatRp(money),
      kembalian: formatRp(money - totalCalc),
    });

    if (!isConfirmed) return;

    // @ts-ignore
    const res = await window.api.createTransaction(cleanCart, totalCalc);

    if (res.success) {
      showNotification("Transaksi Berhasil!", "success");
      setCart([]);
      setPay("");
      onSuccess();
      setTimeout(() => scanRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (cart.length > 0) handleCheckout();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, pay]);

  const total = cart.reduce((a, b) => a + b.price * Number(b.qty), 0);
  const kembalian = (Number(pay.replace(/\D/g, "")) || 0) - total;

  return (
    <div
      className="main-grid"
      style={{
        gridTemplateColumns: "1fr 360px",
        background: "#0f172a",
        height: "100%",
      }}
    >
      {/* INJECT CSS */}
      <style>
        {`
          .kasir-row:hover { background-color: #334155 !important; transition: background-color 0.2s ease; }
          .empty-row:hover { background-color: transparent !important; cursor: default; }
          .kasir-row:hover input[type="number"] { background-color: #1e293b !important; border-color: #64748b !important; }
        `}
      </style>

      {/* --- TOAST NOTIFIKASI (POJOK KANAN BAWAH) --- */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 9999,
          background: "#1e293b",
          color: "#f8fafc",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
          border: "1px solid #334155",
          borderLeft:
            toast.type === "success"
              ? "5px solid #10b981"
              : "5px solid #ef4444",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          opacity: toast.show ? 1 : 0,
          transform: toast.show ? "translateX(0)" : "translateX(100%)",
          pointerEvents: toast.show ? "auto" : "none",
        }}
      >
        <div
          style={{ color: toast.type === "success" ? "#10b981" : "#ef4444" }}
        >
          {toast.type === "success" ? <Icons.Check /> : <Icons.Alert />}
        </div>
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {toast.type === "success" ? "BERHASIL" : "GAGAL"}
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>
            {toast.msg}
          </div>
        </div>
      </div>

      {/* KIRI: KERANJANG */}
      <div
        className="content-area"
        style={{
          background: "#0f172a",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: "#f8fafc",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          🛒 Keranjang Belanja
        </h3>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                {["Nama Barang", "Harga", "Qty", "Subtotal", ""].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      background: "#0f172a",
                      padding: "16px 20px",
                      textAlign:
                        i === 2 ? "center" : i === 3 ? "right" : "left",
                      color: "#cbd5e1",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      borderBottom: "1px solid #334155",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr className="empty-row">
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "60px",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "3rem",
                        opacity: 0.2,
                        marginBottom: "10px",
                      }}
                    >
                      🛒
                    </div>
                    <i>Belum ada barang yang discan.</i>
                  </td>
                </tr>
              ) : (
                cart.map((c) => (
                  <tr
                    key={c.id}
                    className="kasir-row"
                    style={{ borderBottom: "1px solid #334155" }}
                  >
                    <td style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#f8fafc",
                          fontSize: "1rem",
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        {c.barcode}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#cbd5e1" }}>
                      {formatRp(c.price)}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <input
                        type="number"
                        value={c.qty}
                        onChange={(e) => handleQtyChange(c.id, e.target.value)}
                        onBlur={() => handleQtyBlur(c.id)}
                        style={{
                          width: "60px",
                          textAlign: "center",
                          padding: "8px",
                          background: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "6px",
                          color: "#f8fafc",
                          fontWeight: "bold",
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "#fbbf24",
                      }}
                    >
                      {formatRp(c.price * Number(c.qty))}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          setCart(cart.filter((x) => x.id !== c.id))
                        }
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#ef4444",
                          border: "none",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                        title="Hapus Item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KANAN: INPUT & BAYAR */}
      <div
        className="sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1e293b",
          borderLeft: "1px solid #334155",
          padding: "25px",
        }}
      >
        {/* PANEL SCAN */}
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "auto",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "bold",
              color: "#cbd5e1",
              fontSize: "0.9rem",
            }}
          >
            Scan Barcode
          </label>
          <form onSubmit={handleScanSubmit}>
            <input
              ref={scanRef}
              value={scan}
              onChange={handleScanChange}
              placeholder="Scan barang..."
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 15px",
                fontSize: "1rem",
                border: "1px solid #475569",
                borderRadius: "8px",
                outline: "none",
                background: "#334155",
                color: "#f8fafc",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#475569")}
            />
          </form>
        </div>

        {/* PANEL PEMBAYARAN */}
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "0.9rem",
              color: "#94a3b8",
              marginBottom: "5px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Total Harus Dibayar
          </div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#f8fafc",
              marginBottom: "25px",
              textAlign: "right",
              letterSpacing: "-1px",
            }}
          >
            {formatRp(total)}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontWeight: "600",
                color: "#cbd5e1",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Uang Diterima (Rp)
            </label>
            <input
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="0"
              type="number"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#4ade80",
                background: "#334155",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px",
              background:
                kembalian < 0
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(16, 185, 129, 0.1)",
              borderRadius: "8px",
              marginBottom: "20px",
              border:
                kembalian < 0
                  ? "1px solid rgba(239, 68, 68, 0.2)"
                  : "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <strong style={{ color: "#cbd5e1" }}>Kembali:</strong>
            <strong
              style={{
                color: kembalian < 0 ? "#fca5a5" : "#4ade80",
                fontSize: "1.2rem",
              }}
            >
              {formatRp(kembalian < 0 ? 0 : kembalian)}
            </strong>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!cart.length}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: cart.length ? "#2563eb" : "#334155",
              color: cart.length ? "white" : "#64748b",
              border: "none",
              borderRadius: "8px",
              cursor: cart.length ? "pointer" : "not-allowed",
              transition: "0.2s",
              boxShadow: cart.length
                ? "0 4px 12px rgba(37, 99, 235, 0.3)"
                : "none",
            }}
            title="Tekan Ctrl + Enter"
          >
            BAYAR SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
}
