import { useState, useEffect } from "react";
import "./App.css";
import Gudang from "./pages/Gudang";
import Kasir from "./pages/Kasir";
import Laporan from "./pages/Laporan";
import { Product, CartItem } from "./types";

// --- KOLEKSI IKON ---
const Icons = {
  Settings: () => (
    <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path
        fillRule="evenodd"
        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Chart: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  ),
  Monitor: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {/* Layar Atas */}
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      {/* Detail Garis Layar (Seolah-olah software kasir) */}
      <path d="M6 8h12" opacity="0.5" />
      <path d="M6 12h8" opacity="0.5" />
    </svg>
  ),
  Box: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  ),
  Upload: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  ),
  Download: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12v8.25m0 0l-4.5-4.5m4.5 4.5l4.5-4.5m-4.5-4.5V3"
      />
    </svg>
  ),
};

function App() {
  const TABS = ["laporan", "kasir", "gudang"] as const;
  const [activeTab, setActiveTab] = useState<"laporan" | "kasir" | "gudang">(
    "laporan"
  );
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
    /* @ts-ignore */ await window.api.backupDatabase();
  };
  const handleRestore = async () => {
    /* @ts-ignore */ await window.api.restoreDatabase();
  };

  const getNavStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return {
      padding: "10px 18px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontWeight: isActive ? "700" : "500",
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
      background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
      color: isActive ? "#fbbf24" : "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderBottom: isActive ? "2px solid #fbbf24" : "2px solid transparent",
    };
  };

  return (
    // UBAH BACKGROUND APP JADI GELAP AGAR MENYATU
    <div
      className="app-container"
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER DARK NAVY */}
      <header
        style={{
          background: "#0f172a",
          color: "white",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "70px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "30px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#fbbf24" }}>
              <Icons.Settings />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1
                style={{
                  fontSize: "1.1rem",
                  margin: 0,
                  fontWeight: "800",
                  letterSpacing: "0.5px",
                  color: "#f8fafc",
                  lineHeight: "1.2",
                }}
              >
                OGENG PRESS
              </h1>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#94a3b8",
                  fontWeight: "400",
                  letterSpacing: "0.5px",
                }}
              >
                MANAGEMENT SYSTEM
              </span>
            </div>
          </div>
          <div
            style={{ height: "30px", width: "1px", background: "#334155" }}
          ></div>
          <nav
            style={{
              display: "flex",
              gap: "4px",
              height: "100%",
              alignItems: "center",
            }}
          >
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
          </nav>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* TOMBOL RESET DIHAPUS DARI SINI */}
          <button
            onClick={handleRestore}
            style={{
              background: "transparent",
              color: "#fbbf24",
              border: "1px solid #fbbf24",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
            }}
          >
            <Icons.Upload /> Restore
          </button>
          <button
            onClick={handleBackup}
            style={{
              background: "#fbbf24",
              color: "#0f172a",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              boxShadow: "0 2px 4px rgba(251, 191, 36, 0.3)",
            }}
          >
            <Icons.Download /> Backup
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflow: "hidden", background: "#0f172a" }}>
        {activeTab === "laporan" && <Laporan />}
        {activeTab === "kasir" && (
          <Kasir
            products={products}
            onSuccess={loadProducts}
            cart={cart}
            setCart={setCart}
            pay={pay}
            setPay={setPay}
          />
        )}
        {activeTab === "gudang" && <Gudang onUpdate={loadProducts} />}
      </div>
    </div>
  );
}

export default App;
