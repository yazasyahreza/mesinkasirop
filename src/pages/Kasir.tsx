import { useState, useRef, useEffect } from "react";
import { Product, CartItem, PaymentMethod } from "../types";

// --- ICONS ---
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
  Cash: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Card: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="6.01" y2="15" />
      <line x1="10" y1="15" x2="13" y2="15" />
    </svg>
  ),
  Qr: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
      <path d="M14 14h3v3h-3z" />
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TUNAI");
  const [discountInput, setDiscountInput] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({ show: false, msg: "", type: "success" });
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => scanRef.current?.focus(), 100);
  }, []);

  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");
  const showNotification = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

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

  useEffect(() => {
    if (!scan) return;
    const found = products.find((p) => p.barcode === scan);
    if (found) {
      const timer = setTimeout(() => {
        handleAddItem(scan);
        setScan("");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scan, products, cart]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan) return;
    const found = products.find((p) => p.barcode === scan);
    if (found) return;
    showNotification("Barang tidak ditemukan!", "error");
    setScan("");
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

  const subTotal = cart.reduce((a, b) => a + b.price * Number(b.qty), 0);
  let discountValue = 0;
  if (discountInput.includes("%")) {
    const percent = parseFloat(discountInput.replace("%", ""));
    if (!isNaN(percent)) discountValue = (subTotal * percent) / 100;
  } else {
    discountValue = parseFloat(discountInput.replace(/\D/g, "")) || 0;
  }
  if (discountValue > subTotal) discountValue = subTotal;
  const grandTotal = subTotal - discountValue;
  const moneyReceived =
    paymentMethod === "TUNAI" ? Number(pay.replace(/\D/g, "")) : grandTotal;
  const kembalian = moneyReceived - grandTotal;

  const handleCheckout = async () => {
    const cleanCart = cart.map((c) => ({ ...c, qty: Number(c.qty) || 1 }));
    if (paymentMethod === "TUNAI" && moneyReceived < grandTotal) {
      showNotification("Uang pembayaran kurang!", "error");
      return;
    }
    // @ts-ignore
    const isConfirmed = await window.api.confirmPayment({
      total: formatRp(grandTotal),
      bayar: formatRp(moneyReceived),
      kembalian: formatRp(kembalian),
    });
    if (!isConfirmed) return;
    // @ts-ignore
    const res = await window.api.createTransaction(
      cleanCart,
      subTotal,
      discountValue,
      paymentMethod
    );
    if (res.success) {
      showNotification("Transaksi Berhasil!", "success");
      setCart([]);
      setPay("");
      setDiscountInput("");
      setPaymentMethod("TUNAI");
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
  }, [cart, pay, discountInput, paymentMethod]);

  return (
    // [FIX UTAMA] Menambahkan display: "grid" secara eksplisit agar kolom terbagi
    <div
      className="main-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        background: "#0f172a",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; border: 2px solid #1e293b; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .kasir-row:hover { background-color: #334155 !important; transition: background-color 0.2s ease; }
        .empty-row:hover { background-color: transparent !important; cursor: default; }
        .kasir-row:hover input[type="number"] { background-color: #1e293b !important; border-color: #64748b !important; }
        .pay-btn { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        .pay-btn:hover { background: #334155; }
        .pay-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
      `}</style>

      {/* TOAST */}
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
          transition: "all 0.4s",
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
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
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
            overflow: "hidden",
            background: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="custom-scroll" style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  {["Barang", "Harga", "Qty", "Total", ""].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        background: "#0f172a",
                        padding: "16px 20px",
                        textAlign:
                          i === 2 ? "center" : i === 3 ? "right" : "left",
                        color: "#cbd5e1",
                        fontSize: "0.8rem",
                        borderBottom: "1px solid #334155",
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
                      <td style={{ padding: "16px 20px", color: "#f8fafc" }}>
                        <div style={{ fontWeight: "600" }}>{c.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
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
                          onChange={(e) =>
                            handleQtyChange(c.id, e.target.value)
                          }
                          onBlur={() => handleQtyBlur(c.id)}
                          style={{
                            width: "50px",
                            textAlign: "center",
                            padding: "8px",
                            background: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "6px",
                            color: "#f8fafc",
                            outline: "none",
                            fontWeight: "bold",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          color: "#fbbf24",
                          fontWeight: "bold",
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
                            background: "rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            cursor: "pointer",
                            transition: "0.2s",
                          }}
                          title="Hapus"
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
      </div>

      {/* KANAN: PANEL PEMBAYARAN */}
      <div
        className="sidebar custom-scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#1e293b",
          borderLeft: "1px solid #334155",
          padding: "25px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "20px",
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
                padding: "12px 15px",
                border: "1px solid #475569",
                borderRadius: "8px",
                background: "#334155",
                color: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#475569")}
            />
          </form>
        </div>
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#94a3b8",
              marginBottom: "10px",
              fontSize: "0.9rem",
            }}
          >
            <span>Subtotal</span>
            <span>{formatRp(subTotal)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Diskon</span>
            <input
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="Rp / %"
              style={{
                width: "80px",
                padding: "4px 8px",
                textAlign: "right",
                background: "transparent",
                border: "1px solid #475569",
                borderRadius: "4px",
                color: "#ef4444",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              height: "1px",
              background: "#334155",
              marginBottom: "15px",
            }}
          ></div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#94a3b8",
              marginBottom: "5px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            GRAND TOTAL
          </div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#f8fafc",
              textAlign: "right",
              letterSpacing: "-1px",
            }}
          >
            {formatRp(grandTotal)}
          </div>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "bold",
              color: "#cbd5e1",
              fontSize: "0.9rem",
            }}
          >
            Metode Pembayaran
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {[
              { id: "TUNAI", icon: <Icons.Cash />, label: "Tunai" },
              { id: "QRIS", icon: <Icons.Qr />, label: "QRIS" },
              { id: "DEBIT", icon: <Icons.Card />, label: "Debit" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                className={`pay-btn ${paymentMethod === m.id ? "active" : ""}`}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "0.2s",
                }}
              >
                {m.icon}
                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
        {paymentMethod === "TUNAI" && (
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontWeight: "600",
                color: "#cbd5e1",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Uang Diterima
            </label>
            <input
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="0"
              type="number"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#4ade80",
                background: "#334155",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px",
            background:
              kembalian < 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            borderRadius: "8px",
            marginBottom: "20px",
            border:
              kembalian < 0
                ? "1px solid rgba(239,68,68,0.2)"
                : "1px solid rgba(16,185,129,0.2)",
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
            marginTop: "auto",
          }}
        >
          PROSES BAYAR
        </button>
      </div>
    </div>
  );
}
