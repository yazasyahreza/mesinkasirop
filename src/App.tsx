import { useState, useEffect } from "react";
import "./App.css";
import Gudang from "./pages/Gudang";
import Kasir from "./pages/Kasir";
import Laporan from "./pages/Laporan";
import Riwayat from "./pages/Riwayat";
import { Product, CartItem } from "./types";

// --- KOLEKSI IKON SVG (CLEAN LINE STYLE) ---
const Icons = {
  Store: () => (
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Chart: () => (
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Monitor: () => (
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
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Box: () => (
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  FileText: () => (
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Upload: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Download: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

function App() {
  const TABS = ["laporan", "kasir", "gudang", "riwayat"] as const;
  const [activeTab, setActiveTab] = useState<
    "laporan" | "kasir" | "gudang" | "riwayat"
  >("laporan");

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pay, setPay] = useState("");

  const loadProducts = async () => {
    // @ts-ignore
    const data = await window.api.fetchProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Shortcut Keyboard (Ctrl + Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        setActiveTab((prev) => {
          const currentIndex = TABS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % TABS.length;
          return TABS[nextIndex];
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBackup = async () => {
    // @ts-ignore
    await window.api.backupDatabase();
  };

  const handleRestore = async () => {
    // @ts-ignore
    await window.api.restoreDatabase();
  };

  const getNavStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "0.95rem",
      transition: "all 0.2s ease",
      background: isActive ? "#2563eb" : "white",
      color: isActive ? "white" : "#64748b",
      boxShadow: isActive
        ? "0 4px 6px -1px rgba(37, 99, 235, 0.4)"
        : "0 1px 3px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    };
  };

  return (
    <div className="app-container">
      <header>
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* LOGO AREA (Sudah Clean SVG) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                background: "#0f172a",
                padding: "6px",
                borderRadius: "6px",
                color: "white",
                display: "flex",
              }}
            >
              <Icons.Store />
            </div>
            <h1 style={{ fontSize: "1.2rem", margin: 0, color: "#1e293b" }}>
              Toko Ayah
            </h1>
          </div>

          {/* NAVBAR (Sudah Clean SVG) */}
          <nav style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("laporan")}
              style={getNavStyle("laporan")}
            >
              <Icons.Chart /> Laporan
            </button>
            <button
              onClick={() => setActiveTab("kasir")}
              style={getNavStyle("kasir")}
            >
              <Icons.Monitor /> Kasir
            </button>
            <button
              onClick={() => setActiveTab("gudang")}
              style={getNavStyle("gudang")}
            >
              <Icons.Box /> Gudang
            </button>
            <button
              onClick={() => setActiveTab("riwayat")}
              style={getNavStyle("riwayat")}
            >
              <Icons.FileText /> Riwayat
            </button>
          </nav>
        </div>

        {/* TOMBOL NAVIGASI KANAN (Sudah Clean SVG) */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleRestore}
            style={{
              background: "#d97706",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.9rem",
            }}
          >
            <Icons.Upload /> Restore
          </button>

          <button
            onClick={handleBackup}
            style={{
              background: "#0f172a",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.9rem",
            }}
          >
            <Icons.Download /> Backup
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "laporan" && <Laporan />}

        {/* LOGIKA KASIR TIDAK DIUBAH AGAR TIDAK ERROR */}
        {activeTab === "kasir" && (
          <Kasir
            products={products}
            onSuccess={loadProducts} // Props tetap sesuai file original Anda
            cart={cart}
            setCart={setCart}
            pay={pay}
            setPay={setPay}
          />
        )}

        {activeTab === "gudang" && (
          <Gudang products={products} onRefresh={loadProducts} />
        )}
        {activeTab === "riwayat" && <Riwayat />}
      </div>
    </div>
  );
}

export default App;
