import { useState, useRef, useEffect } from "react";
import { Product } from "../types";

// --- IKON SVG CLEAN (UPDATED) ---
const Icons = {
  Edit: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Save: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Cancel: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Search: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  // [BARU] Ikon Segitiga Peringatan (Lebih Jelas untuk Error)
  Alert: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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

interface GudangProps {
  onUpdate: () => void;
}

export default function Gudang({ onUpdate }: GudangProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({ show: false, msg: "", type: "success" });
  const [form, setForm] = useState({
    barcode: "",
    name: "",
    cost_price: "",
    price: "",
    stock: "",
    category: "",
    item_number: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    /* @ts-ignore */ const data = await window.api.fetchProducts();
    setProducts(data);
  };
  useEffect(() => {
    loadProducts();
  }, []);

  const showNotification = (
    msg: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const data = {
      ...form,
      cost_price: Number(String(form.cost_price).replace(/\D/g, "")) || 0,
      price: Number(String(form.price).replace(/\D/g, "")) || 0,
      stock: Number(String(form.stock).replace(/\D/g, "")) || 0,
    };
    // @ts-ignore
    const res = editId
      ? await window.api.updateProduct(editId, data)
      : await window.api.createProduct(data);
    if (res.success) {
      setEditId(null);
      setForm({
        barcode: "",
        name: "",
        cost_price: "",
        price: "",
        stock: "",
        category: "",
        item_number: "",
      });
      loadProducts();
      onUpdate();
      showNotification(editId ? "Data diperbarui" : "Barang ditambahkan");
      setTimeout(() => barcodeRef.current?.focus(), 100);
    } else {
      showNotification("Gagal menyimpan", "error");
    }
  };

  const handleDelete = async (id: number) => {
    // @ts-ignore
    const res = await window.api.deleteProduct(id);
    if (res.success) {
      loadProducts();
      onUpdate();
      showNotification("Barang dihapus");
    } else {
      if (res.reason === "LOCKED")
        showNotification("Gagal: Barang ada di transaksi hari ini", "error");
      else showNotification("Error sistem", "error");
    }
  };

  const handleEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      barcode: p.barcode,
      name: p.name,
      cost_price: p.cost_price.toString(),
      price: p.price.toString(),
      stock: p.stock.toString(),
      category: p.category || "",
      item_number: p.item_number || "",
    });
  };

  const activeProducts = products.filter(
    (p) => !p.name.toUpperCase().includes("NONAKTIF")
  );
  const totalItems = activeProducts.length;
  const totalAsset = activeProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const lowStockCount = activeProducts.filter((p) => p.stock < 5).length;
  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.barcode.includes(term) ||
      (p.item_number && p.item_number.toLowerCase().includes(term))
    );
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    background: "#334155",
    border: "1px solid #475569",
    color: "#f8fafc",
    outline: "none",
    fontSize: "0.9rem",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    color: "#cbd5e1",
    fontSize: "0.85rem",
    fontWeight: "500",
  };

  return (
    <div
      className="main-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "0",
        height: "100%",
      }}
    >
      <style>
        {`
          /* Custom Scrollbar */
          .custom-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent; 
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 4px;
            border: 2px solid #1e293b;
          }
          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }

          /* Hover Row Effect */
          .gudang-row:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
            transition: background-color 0.2s ease;
          }
        `}
      </style>

      {/* TOAST NOTIFIKASI */}
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

      {/* SIDEBAR FORM */}
      <div
        className="sidebar custom-scroll"
        style={{
          background: "#1e293b",
          borderRight: "1px solid #334155",
          padding: "25px 20px",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            color: editId ? "#fbbf24" : "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: 0,
            marginBottom: "25px",
            fontSize: "1.2rem",
          }}
        >
          {editId ? (
            <>
              <Icons.Edit /> Edit Barang
            </>
          ) : (
            <>
              <Icons.Plus /> Tambah Barang
            </>
          )}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Barcode / Scan</label>
            <input
              ref={barcodeRef}
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              placeholder="Scan kode..."
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={labelStyle}>Nama Barang</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Oli Yamalube"
              style={inputStyle}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kategori</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Oli"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kode Part</label>
              <input
                value={form.item_number}
                onChange={(e) =>
                  setForm({ ...form, item_number: e.target.value })
                }
                placeholder="A1"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Modal</label>
              <input
                value={form.cost_price}
                onChange={(e) =>
                  setForm({ ...form, cost_price: e.target.value })
                }
                placeholder="0"
                type="number"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Jual</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                type="number"
                style={{ ...inputStyle, border: "1px solid #6366f1" }}
                required
              />
            </div>
          </div>
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>Stok Awal</label>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
              type="number"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              background: editId ? "#fbbf24" : "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.95rem",
              transition: "0.2s",
            }}
          >
            <Icons.Save /> {editId ? "SIMPAN PERUBAHAN" : "SIMPAN DATA"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({
                  barcode: "",
                  name: "",
                  cost_price: "",
                  price: "",
                  stock: "",
                  category: "",
                  item_number: "",
                });
              }}
              style={{
                marginTop: "10px",
                width: "100%",
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icons.Cancel /> Batal Edit
            </button>
          )}
        </form>
      </div>

      {/* KONTEN KANAN */}
      <div
        className="content-area"
        style={{
          background: "#0f172a",
          padding: "30px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          {[
            { label: "Total Barang", val: totalItems, color: "#f8fafc" },
            {
              label: "Total Aset",
              val: `Rp ${totalAsset.toLocaleString("id-ID")}`,
              color: "#fbbf24",
            },
            {
              label: "Stok Menipis",
              val: lowStockCount,
              color: lowStockCount > 0 ? "#ef4444" : "#10b981",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: item.color,
                }}
              >
                {item.val}
              </div>
            </div>
          ))}
        </div>

        {/* HEADER & SEARCH */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ margin: 0, color: "#f8fafc" }}>Stok Sparepart</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "8px 12px",
              width: "280px",
            }}
          >
            <span
              style={{ marginRight: "10px", color: "#64748b", display: "flex" }}
            >
              <Icons.Search />
            </span>
            <input
              placeholder="Cari nama / kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                fontSize: "0.95rem",
                color: "#f8fafc",
              }}
            />
          </div>
        </div>

        {/* TABEL - WRAPPER BORDER */}
        <div
          style={{
            flex: 1,
            background: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="custom-scroll" style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  {[
                    "NAMA / KODE",
                    "KATEGORI",
                    "MODAL",
                    "JUAL",
                    "STOK",
                    "AKSI",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        background: "#0f172a",
                        padding: "16px 20px",
                        textAlign: i > 3 ? "center" : "left",
                        fontSize: "0.75rem",
                        color: "#cbd5e1",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        borderBottom: "2px solid #334155",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="gudang-row"
                    style={{
                      borderBottom: "1px solid #334155",
                      background:
                        editId === p.id
                          ? "rgba(251, 191, 36, 0.1)"
                          : "transparent",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontWeight: "600", color: "#f8fafc" }}>
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        {p.barcode} {p.item_number ? `• ${p.item_number}` : ""}
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          background: "#334155",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          color: "#cbd5e1",
                        }}
                      >
                        {p.category || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#94a3b8" }}>
                      Rp {p.cost_price.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontWeight: "bold",
                        color: "#fbbf24",
                      }}
                    >
                      Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span
                        style={{
                          background:
                            p.stock < 5
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(16, 185, 129, 0.2)",
                          color: p.stock < 5 ? "#fca5a5" : "#6ee7b7",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(p)}
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "#334155",
                            color: "#94a3b8",
                            padding: "6px",
                            borderRadius: "6px",
                            display: "flex",
                          }}
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#ef4444",
                            padding: "6px",
                            borderRadius: "6px",
                            display: "flex",
                          }}
                          title="Hapus"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
