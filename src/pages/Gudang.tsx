import { useState, useRef } from "react";
import { Product } from "../types";

// --- IKON SVG CLEAN (Pengganti Emoji) ---
// Ukuran disesuaikan agar sama dengan emoji (18px)
const Icons = {
  Edit: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

interface GudangProps {
  products: Product[];
  onRefresh: () => void;
}

export default function Gudang({ products, onRefresh }: GudangProps) {
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

  // --- STATISTIK ---
  const activeProducts = products.filter(
    (p) => !p.name.toUpperCase().includes("NONAKTIF")
  );
  const totalItems = activeProducts.length;
  const totalAsset = activeProducts.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const lowStockCount = activeProducts.filter((p) => p.stock < 5).length;

  // --- LOGIKA FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const data = {
      ...form,
      cost_price: Number(form.cost_price.replace(/\D/g, "")) || 0,
      price: Number(form.price.replace(/\D/g, "")) || 0,
      stock: Number(form.stock.replace(/\D/g, "")) || 0,
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
      onRefresh();
      setTimeout(() => barcodeRef.current?.focus(), 100);
    }
  };

  const handleDelete = async (id: number) => {
    // @ts-ignore
    const res = await window.api.deleteProduct(id);
    if (res.success) onRefresh();
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

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.barcode.includes(term) ||
      (p.item_number && p.item_number.toLowerCase().includes(term));
    const isArchived = p.name.toUpperCase().includes("NONAKTIF");
    return term.includes("nonaktif")
      ? matchesSearch
      : matchesSearch && !isArchived;
  });

  return (
    <div className="main-grid">
      {/* SIDEBAR FORM INPUT */}
      <div className="sidebar">
        {/* HAPUS STIKER: Ganti dengan Teks/Icon Bersih */}
        <h3
          style={{
            color: editId ? "#d97706" : "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
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
          <div className="input-group">
            <label>Barcode</label>
            <input
              ref={barcodeRef}
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              placeholder="Scan..."
            />
          </div>

          <div className="input-group">
            <label>Nama Barang</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Oli Yamalube"
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div className="input-group">
              <label>Kategori</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Misal: Oli"
              />
            </div>
            <div className="input-group">
              <label>No. Part / Barang</label>
              <input
                value={form.item_number}
                onChange={(e) =>
                  setForm({ ...form, item_number: e.target.value })
                }
                placeholder="Misal: YMH-123"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div className="input-group">
              <label>Modal (Rp)</label>
              <input
                value={form.cost_price}
                onChange={(e) =>
                  setForm({ ...form, cost_price: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>Jual (Rp)</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Stok</label>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              background: editId ? "#f59e0b" : "#2563eb",
              transition: "background 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {/* Ganti Emoji Save dengan Icon */}
            <Icons.Save />
            {editId ? "UPDATE DATA" : "SIMPAN DATA"}
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
                background: "#fee2e2",
                color: "#dc2626",
                border: "none",
                padding: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
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
      <div className="content-area">
        {/* PANEL STATISTIK */}
        <div className="stats-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-card">
            <div className="stat-label">Total Barang</div>
            <div className="stat-value">{totalItems}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Aset</div>
            <div className="stat-value" style={{ color: "#2563eb" }}>
              Rp {totalAsset.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stok Menipis</div>
            <div
              className="stat-value"
              style={{ color: lowStockCount > 0 ? "#dc2626" : "#10b981" }}
            >
              {lowStockCount}
            </div>
          </div>
        </div>

        <div className="table-header-tools">
          {/* HAPUS STIKER: Hanya Teks */}
          <h3>Stok Sparepart</h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "8px 12px",
              width: "250px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <span
              style={{ marginRight: "8px", display: "flex", color: "#94a3b8" }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path
                  d="m21 21-4.3-4.3"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.95rem",
                color: "#334155",
                background: "transparent",
              }}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama / Kode</th>
                <th>Kategori</th>
                <th>Modal</th>
                <th>Jual</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    background: editId === p.id ? "#fffbeb" : "transparent",
                  }}
                >
                  <td>
                    <div style={{ fontWeight: "bold" }}>{p.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {p.barcode} {p.item_number ? `• ${p.item_number}` : ""}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {p.category || "-"}
                    </span>
                  </td>
                  <td style={{ color: "#64748b" }}>
                    Rp {p.cost_price.toLocaleString("id-ID")}
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    Rp {p.price.toLocaleString("id-ID")}
                  </td>
                  <td>
                    <span
                      style={{
                        background: p.stock < 5 ? "#fee2e2" : "#d1fae5",
                        color: p.stock < 5 ? "#dc2626" : "#059669",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {/* Ganti Tombol Emoji dengan Icon SVG */}
                      <button
                        onClick={() => handleEdit(p)}
                        style={{
                          marginRight: "5px",
                          cursor: "pointer",
                          border: "none",
                          background: "none",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
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
                          background: "none",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
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
  );
}
