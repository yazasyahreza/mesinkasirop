import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { compressImage } from "../utils/imageCompressor";

export default function MobileApp() {
  const [ip, setIp] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // State UI
  const [showScanner, setShowScanner] = useState(false);
  const [view, setView] = useState<"menu" | "form">("menu");

  // State Data
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Semua");

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Data Form
  const [formData, setFormData] = useState({
    id: null,
    barcode: "",
    name: "",
    category: "",
    brand: "",
    compatibility: "",
    item_number: "",
    image_url: "",
    cost_price: 0,
    price: 0,
    stock: 0,
  });

  // --- KONEKSI ---
  const connectToServer = () => {
    fetch(`http://${ip}:3000/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "online") {
          setIsConnected(true);
          localStorage.setItem("server_ip", ip);
          fetchCategories(ip);
          fetchProducts(ip);
        }
      })
      .catch(() => alert("Gagal konek. Cek IP & WiFi!"));
  };

  const fetchCategories = (serverIp: string) => {
    fetch(`http://${serverIp}:3000/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  };

  const fetchProducts = (serverIp: string) => {
    fetch(`http://${serverIp}:3000/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const savedIp = localStorage.getItem("server_ip");
    if (savedIp) setIp(savedIp);
  }, []);

  // --- FILTERING (LOGIKA CERDAS) ---
  const filteredProducts = products.filter((p) => {
    const searchTerms = search
      .toLowerCase()
      .split(" ")
      .filter((term) => term.trim() !== "");
    const productDataString = `
      ${p.name} 
      ${p.barcode} 
      ${p.item_number || ""} 
      ${p.brand || ""} 
      ${p.compatibility || ""}
    `.toLowerCase();
    const matchSearch = searchTerms.every((term) =>
      productDataString.includes(term)
    );
    const matchCat = filterCat === "Semua" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  // --- SCANNER ---
  useEffect(() => {
    if (showScanner && isConnected) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(
        (decodedText) => {
          handleProcessCode(decodedText);
          scanner.clear();
          setShowScanner(false);
        },
        (err) => {}
      );
      scannerRef.current = scanner;
    }
    return () => {
      try {
        scannerRef.current?.clear();
      } catch (e) {}
    };
  }, [showScanner]);

  // --- PROSES KODE ---
  const handleProcessCode = (code: string) => {
    if (!code) {
      alert("Kode kosong!");
      return;
    }

    fetch(`http://${ip}:3000/api/product/${code}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          loadDataToForm(res.data);
        } else {
          setFormData({
            id: null,
            barcode: code,
            name: "",
            category: "",
            brand: "",
            compatibility: "",
            item_number: "",
            image_url: "",
            cost_price: 0,
            price: 0,
            stock: 0,
          });
        }
        setView("form");
      })
      .catch((err) => alert("Error cek barang: " + err));
  };

  const loadDataToForm = (data: any) => {
    setFormData({
      ...data,
      brand: data.brand || "",
      compatibility: data.compatibility || "",
      item_number: data.item_number || "",
      image_url: data.image_url || "",
    });
    setView("form");
  };

  // --- HAPUS ---
  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Yakin hapus "${name}"?`)) return;
    fetch(`http://${ip}:3000/api/product/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("🗑️ Terhapus!");
          fetchProducts(ip);
          fetchCategories(ip);
        } else {
          alert("Gagal: " + res.error);
        }
      });
  };

  // --- HANDLE FILE HP ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Gambar terlalu besar! Maks 2MB.");
        return;
      }
      try {
        const compressedString = await compressImage(file);
        setFormData({ ...formData, image_url: compressedString });
      } catch (error) {
        alert("Gagal proses gambar");
      }
    }
  };

  // --- SIMPAN ---
  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert("Nama dan Harga Jual wajib diisi!");
      return;
    }

    fetch(`http://${ip}:3000/api/product/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("✅ Data Tersimpan!");
          setView("menu");
          fetchCategories(ip);
          fetchProducts(ip);
          setFormData({
            id: null,
            barcode: "",
            name: "",
            category: "",
            brand: "",
            compatibility: "",
            item_number: "",
            image_url: "",
            cost_price: 0,
            price: 0,
            stock: 0,
          });
        } else {
          alert("Gagal simpan: " + res.error);
        }
      })
      .catch((err) => alert("Koneksi Error"));
  };

  if (!isConnected) {
    return (
      <div
        style={{
          padding: 20,
          background: "#111",
          minHeight: "100vh",
          color: "white",
        }}
      >
        <h2>🔗 Sambungkan ke Gudang</h2>
        <input
          placeholder="IP Laptop"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          style={inputConnectStyle}
        />
        <button onClick={connectToServer} style={btnConnectStyle}>
          SAMBUNGKAN
        </button>
      </div>
    );
  }

  if (view === "menu") {
    return (
      <div
        style={{
          padding: 10,
          background: "#f1f5f9",
          minHeight: "100vh",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 15,
            borderRadius: 12,
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            marginBottom: 15,
          }}
        >
          <h3 style={{ color: "#0f172a", marginTop: 0, marginBottom: 10 }}>
            📦 Data Gudang ({products.length})
          </h3>
          <input
            placeholder="🔍 Cari Nama / Kode / Part / Merek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 5 }}>
            <select
              style={{ ...inputStyle, flex: 1 }}
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="Semua">📂 Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                fetchProducts(ip);
                fetchCategories(ip);
              }}
              style={{
                background: "#e2e8f0",
                border: "none",
                borderRadius: 8,
                width: 45,
                fontSize: 18,
              }}
            >
              🔄
            </button>
          </div>
        </div>

        {showScanner && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.9)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              id="reader"
              style={{ width: "100%", background: "white" }}
            ></div>
            <button
              onClick={() => setShowScanner(false)}
              style={{
                margin: 20,
                padding: 15,
                background: "#ef4444",
                color: "white",
                borderRadius: 8,
                border: "none",
                fontWeight: "bold",
              }}
            >
              TUTUP KAMERA
            </button>
          </div>
        )}

        {/* TABEL DATA HP */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead
                style={{
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                <tr>
                  <th style={thStyle}>Detail Barang</th>
                  <th style={thStyle}>Harga</th>
                  <th style={{ ...thStyle, width: "12%" }}>Stok</th>
                  <th style={{ ...thStyle, width: "18%", textAlign: "center" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 20,
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, idx) => (
                    <tr
                      key={p.id || idx}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      {/* [UPDATE] FOTO DIPERBESAR (80px) DI TABEL HP */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              flexShrink: 0,
                              borderRadius: "6px",
                              overflow: "hidden",
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e: any) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            ) : (
                              <span style={{ fontSize: "24px", opacity: 0.5 }}>
                                📦
                              </span>
                            )}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: "bold",
                                color: "#0f172a",
                                fontSize: "14px",
                              }}
                            >
                              {p.name}
                            </div>
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: "11px",
                                marginTop: 4,
                                lineHeight: "1.4",
                              }}
                            >
                              <div style={{ marginBottom: 2 }}>
                                <span
                                  style={{
                                    color: "#334155",
                                    background: "#f1f5f9",
                                    padding: "0 4px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {p.barcode}
                                </span>
                                {p.item_number && (
                                  <span
                                    style={{
                                      color: "#d97706",
                                      fontWeight: "bold",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    • {p.item_number}
                                  </span>
                                )}
                              </div>
                              {p.compatibility && (
                                <div
                                  style={{
                                    color: "#059669",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    fontStyle: "italic",
                                  }}
                                >
                                  🏍️ {p.compatibility}
                                </div>
                              )}
                              <div style={{ marginTop: 2 }}>
                                {p.brand && <span>{p.brand} • </span>}
                                <span
                                  style={{
                                    background: "#e2e8f0",
                                    padding: "1px 4px",
                                    borderRadius: 3,
                                    fontSize: "10px",
                                  }}
                                >
                                  {p.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ fontSize: "11px", color: "#ef4444" }}>
                          B: {(p.cost_price || 0).toLocaleString()}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "#16a34a",
                          }}
                        >
                          J: {(p.price || 0).toLocaleString()}
                        </div>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            background: p.stock <= 2 ? "#fee2e2" : "#dcfce7",
                            color: p.stock <= 2 ? "#991b1b" : "#166534",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            fontSize: "13px",
                          }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => loadDataToForm(p)}
                            style={{
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              const code = prompt("Ketik Kode Manual:");
              if (code) handleProcessCode(code);
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid #ccc",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              fontSize: "20px",
            }}
          >
            ⌨️
          </button>
          <button
            onClick={() => setShowScanner(true)}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#fbbf24",
              border: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📷
          </button>
        </div>
      </div>
    );
  }

  // --- FORM ---
  return (
    <div
      style={{
        padding: 20,
        background: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 20,
          borderBottom: "1px solid #cbd5e1",
          paddingBottom: 15,
        }}
      >
        <button
          onClick={() => setView("menu")}
          style={{
            background: "white",
            border: "1px solid #cbd5e1",
            padding: "8px 15px",
            borderRadius: "8px",
            marginRight: 15,
            fontWeight: "bold",
            color: "#64748b",
          }}
        >
          ⬅ Kembali
        </button>
        <h3 style={{ margin: 0, flex: 1, color: "#1e293b" }}>
          {formData.id ? "Edit Data" : "Data Baru"}
        </h3>
      </div>

      <label style={labelStyle}>Kode / Barcode</label>
      <input style={readOnlyInputStyle} value={formData.barcode} readOnly />

      <label style={labelStyle}>Nama Barang</label>
      <input
        style={inputStyle}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nama barang..."
      />

      {/* [UPDATE] Bagian Input Foto dengan Label Status di HP */}
      <label style={labelStyle}>Foto Barang</label>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="file"
          id="mobile-file-upload"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <label
          htmlFor="mobile-file-upload"
          style={{
            ...inputStyle,
            cursor: "pointer",
            background: "white",
            border: "1px dashed #94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#64748b",
            fontWeight: "600",
          }}
        >
          📷 {formData.image_url ? "Ganti Foto" : "Pilih Foto / Kamera"}
        </label>

        {formData.image_url && (
          <div
            style={{
              width: "45px",
              height: "auto", // UBAH KE AUTO AGAR TEKS MUAT
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              background: "white",
              paddingBottom: "4px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "45px",
                height: "45px",
                overflow: "hidden",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <img
                src={formData.image_url}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e: any) => (e.target.style.display = "none")}
              />
              <button
                onClick={() => setFormData({ ...formData, image_url: "" })}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "red",
                  color: "white",
                  border: "none",
                  width: "15px",
                  height: "15px",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                X
              </button>
            </div>

            {/* LABEL STATUS KOMPRESI DI HP */}
            <div
              style={{ fontSize: "8px", marginTop: "2px", fontWeight: "bold" }}
            >
              {formData.image_url.startsWith("data:image/webp") ? (
                <span style={{ color: "green" }}>✅ WebP</span>
              ) : (
                <span style={{ color: "red" }}>JPG</span>
              )}
            </div>
          </div>
        )}
      </div>

      <label style={labelStyle}>Kategori</label>
      <input
        list="category-list"
        style={inputStyle}
        value={formData.category}
        placeholder="Pilih / Ketik..."
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        onFocus={() => setFormData((prev) => ({ ...prev, category: "" }))}
      />
      <datalist id="category-list">
        {categories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Merek</label>
          <input
            style={inputStyle}
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Kode Part</label>
          <input
            style={inputStyle}
            value={formData.item_number}
            onChange={(e) =>
              setFormData({ ...formData, item_number: e.target.value })
            }
          />
        </div>
      </div>

      <label style={labelStyle}>Untuk Motor (Kompatibilitas)</label>
      <input
        style={inputStyle}
        value={formData.compatibility}
        onChange={(e) =>
          setFormData({ ...formData, compatibility: e.target.value })
        }
      />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Modal (Rp)</label>
          <input
            type="number"
            style={inputStyle}
            value={formData.cost_price || ""}
            placeholder="0"
            onChange={(e) =>
              setFormData({
                ...formData,
                cost_price: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Jual (Rp)</label>
          <input
            type="number"
            style={inputStyle}
            value={formData.price || ""}
            placeholder="0"
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      <label style={labelStyle}>Stok Fisik</label>
      <input
        type="number"
        style={inputStyle}
        value={formData.stock || ""}
        placeholder="0"
        onChange={(e) =>
          setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })
        }
      />

      <button onClick={handleSave} style={btnSaveStyle}>
        SIMPAN KE LAPTOP
      </button>
    </div>
  );
}

// --- STYLES ---
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #94a3b8",
  fontSize: "16px",
  boxSizing: "border-box" as const,
  backgroundColor: "#ffffff",
  color: "#0f172a",
  outline: "none",
};
const readOnlyInputStyle = {
  ...inputStyle,
  backgroundColor: "#e2e8f0",
  color: "#334155",
  fontWeight: "bold",
  border: "1px solid #cbd5e1",
};
const labelStyle = {
  display: "block",
  fontSize: "13px",
  color: "#475569",
  marginBottom: "5px",
  marginTop: "15px",
  fontWeight: "600",
};
const inputConnectStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 15,
  fontSize: 16,
  borderRadius: 8,
  backgroundColor: "white",
  border: "none",
};
const btnConnectStyle = {
  width: "100%",
  padding: 15,
  background: "#2563eb",
  color: "white",
  borderRadius: 8,
  fontWeight: "bold",
};
const btnSaveStyle = {
  width: "100%",
  padding: 16,
  background: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  marginTop: 30,
  fontSize: 16,
  boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
};
const thStyle = {
  padding: "10px 8px",
  textAlign: "left" as const,
  color: "#475569",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};
const tdStyle = { padding: "12px 8px", fontSize: "13px", verticalAlign: "top" };
