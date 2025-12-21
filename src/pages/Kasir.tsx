import { useState, useRef, useEffect } from "react";
import { Product, CartItem } from "../types";

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

  // State notifikasi
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const scanRef = useRef<HTMLInputElement>(null);

  // Auto fokus
  useEffect(() => {
    setTimeout(() => scanRef.current?.focus(), 100);
  }, []);

  // Helper format rupiah
  const formatRp = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const p = products.find((i) => i.barcode === scan);

    if (!p) {
      setMessage({ text: "❌ Barang tidak ditemukan!", type: "error" });
      setScan("");
      return;
    }

    const exist = cart.find((c) => c.id === p.id);
    const currentQty = exist ? Number(exist.qty) : 0;

    if (currentQty + 1 > p.stock) {
      setMessage({ text: `❌ Stok habis! Sisa: ${p.stock}`, type: "error" });
      setScan("");
      return;
    }

    if (exist) {
      setCart(
        cart.map((c) => (c.id === p.id ? { ...c, qty: Number(c.qty) + 1 } : c))
      );
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
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
      setMessage({
        text: `⚠️ Stok hanya tersedia ${item.stock}`,
        type: "error",
      });
      finalQty = item.stock;
    }
    setCart(cart.map((c) => (c.id === id ? { ...c, qty: finalQty } : c)));
  };

  const handleCheckout = async () => {
    setMessage(null);
    const cleanCart = cart.map((c) => ({ ...c, qty: Number(c.qty) || 1 }));
    const total = cleanCart.reduce((a, b) => a + b.price * b.qty, 0);
    const money = Number(pay.replace(/\D/g, ""));

    if (money < total) {
      setMessage({ text: "❌ Uang pembayaran kurang!", type: "error" });
      return;
    }

    // @ts-ignore
    const res = await window.api.createTransaction(cleanCart, total);

    if (res.success) {
      setMessage({ text: "✅ Transaksi Berhasil Disimpan!", type: "success" });
      setCart([]);
      setPay("");
      onSuccess();
      setTimeout(() => scanRef.current?.focus(), 100);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const total = cart.reduce((a, b) => a + b.price * Number(b.qty), 0);
  const kembalian = (Number(pay.replace(/\D/g, "")) || 0) - total;

  return (
    <div className="main-grid" style={{ gridTemplateColumns: "1fr 350px" }}>
      {/* KIRI: KERANJANG */}
      <div className="content-area">
        <h3 style={{ marginTop: 0 }}>🛒 Keranjang Belanja</h3>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Harga</th>
                <th style={{ textAlign: "center", width: "80px" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Subtotal</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    <i>Belum ada barang yang discan.</i>
                  </td>
                </tr>
              ) : (
                cart.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: "bold" }}>{c.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {c.barcode}
                      </div>
                    </td>
                    <td>{formatRp(c.price)}</td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        value={c.qty}
                        onChange={(e) => handleQtyChange(c.id, e.target.value)}
                        onBlur={() => handleQtyBlur(c.id)}
                        style={{
                          width: "50px",
                          textAlign: "center",
                          padding: "5px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          background: "white",
                          color: "black",
                        }}
                      />
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      {formatRp(c.price * Number(c.qty))}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          setCart(cart.filter((x) => x.id !== c.id))
                        }
                        style={{
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
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
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#334155",
            }}
          >
            Scan Barcode
          </label>
          <form onSubmit={handleScan}>
            <input
              ref={scanRef}
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              placeholder="Scan barang..."
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box", // [FIX] Agar padding tidak membuat input melebar keluar
                padding: "12px 15px",
                fontSize: "1rem",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                outline: "none",
                background: "#f0f9ff",
                color: "#333",
              }}
            />
          </form>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{ fontSize: "1rem", color: "#64748b", marginBottom: "5px" }}
          >
            Total Harus Dibayar
          </div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#1e293b",
              marginBottom: "20px",
              textAlign: "right",
            }}
          >
            {formatRp(total)}
          </div>

          <div className="input-group" style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold" }}>Uang Diterima (Rp)</label>
            <input
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="0"
              type="number"
              style={{
                width: "100%",
                boxSizing: "border-box", // [FIX] Tambahkan ini juga agar rapi
                padding: "12px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                color: "#059669",
                background: "#fff",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px",
              background: kembalian < 0 ? "#fff1f2" : "#f0fdf4",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <strong style={{ color: "#334155" }}>Kembali:</strong>
            <strong
              style={{
                color: kembalian < 0 ? "#e11d48" : "#166534",
                fontSize: "1.1rem",
              }}
            >
              {formatRp(kembalian < 0 ? 0 : kembalian)}
            </strong>
          </div>

          {message && (
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "6px",
                fontWeight: "bold",
                background: message.type === "error" ? "#fee2e2" : "#dcfce7",
                color: message.type === "error" ? "#dc2626" : "#166534",
                border:
                  message.type === "error"
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
              }}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={!cart.length}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "1.1rem",
              background: cart.length ? "#2563eb" : "#94a3b8",
              cursor: cart.length ? "pointer" : "not-allowed",
            }}
          >
            BAYAR SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
}
