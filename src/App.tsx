import { useState, useEffect } from "react";
import Gudang from "./pages/Gudang";
import Kasir from "./pages/Kasir";
import Laporan from "./pages/Laporan";
import MobileApp from "./pages/MobileApp"; // [BARU] Import Halaman HP
import { Product, CartItem } from "./types";

// --- ICONS NAVBAR ---
const NavIcons = {
  Home: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    </svg>
  ),
  Box: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Monitor: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  ),
  Chart: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Smartphone: () => (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
};

function App() {
  // [BARU] Cek apakah URL-nya "/mobile" (untuk tampilan HP)
  const isMobileView = window.location.pathname === "/mobile";

  const [page, setPage] = useState<"gudang" | "kasir" | "laporan">("laporan");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pay, setPay] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [serverIp, setServerIp] = useState<string>(""); // [BARU] Simpan IP Server

  const refreshProducts = async () => {
    try {
      // @ts-ignore
      const data = await window.api.fetchProducts();
      if (data) setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, [lastUpdate]);

  // [BARU] Listen IP Server dari Main Process
  useEffect(() => {
    // @ts-ignore
    window.ipcRenderer?.on("server-ip", (_event, ip) => {
      setServerIp(ip);
    });
    // @ts-ignore
    window.ipcRenderer?.on("main-process-message", (_event, msg) => {
      // Refresh jika ada transaksi masuk dari HP
      if (msg.includes("Transaksi baru")) setLastUpdate(Date.now());
    });
  }, []);

  // LOGIKA SHORTCUT NAVIGASI (CTRL + TAB)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab") {
        e.preventDefault();
        setPage((prevPage) => {
          if (prevPage === "kasir") return "gudang";
          if (prevPage === "gudang") return "laporan";
          return "kasir";
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

  // [PENTING] Jika mode HP, tampilkan MobileApp saja (Full Screen)
  if (isMobileView) {
    return <MobileApp />;
  }

  // --- TAMPILAN DESKTOP (LAPTOP) ---
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          height: "65px",
          flexShrink: 0,
          width: "100%",
          background: "#0f172a",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          padding: "0 25px",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fbbf24",
                color: "#fbbf24",
                fontWeight: "bold",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: "#fbbf24",
                  borderRadius: "50%",
                }}
              ></div>
            </div>
            <div>
              <div
                style={{
                  fontWeight: "900",
                  fontSize: "1.1rem",
                  letterSpacing: "-0.5px",
                  lineHeight: "1",
                }}
              >
                OGENG PRESS
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#64748b",
                  letterSpacing: "1px",
                  fontWeight: "500",
                }}
              >
                MANAGEMENT SYSTEM
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { id: "laporan", label: "Laporan", icon: <NavIcons.Chart /> },
              { id: "kasir", label: "Kasir", icon: <NavIcons.Monitor /> },
              { id: "gudang", label: "Gudang", icon: <NavIcons.Box /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id as any)}
                style={{
                  background:
                    page === item.id
                      ? "rgba(251, 191, 36, 0.1)"
                      : "transparent",
                  color: page === item.id ? "#fbbf24" : "#94a3b8",
                  border:
                    page === item.id
                      ? "1px solid rgba(251, 191, 36, 0.4)"
                      : "1px solid transparent",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* [BARU] Indikator IP Server untuk HP */}
          {serverIp && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#10b981",
                fontSize: "0.85rem",
                fontWeight: "600",
                background: "rgba(16, 185, 129, 0.1)",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                cursor: "help",
              }}
              title="Ketik alamat ini di Browser HP Anda untuk akses Kasir Mobile"
            >
              <NavIcons.Smartphone /> {serverIp}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#cbd5e1",
              fontSize: "0.9rem",
              fontWeight: "500",
              background: "#1e293b",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #334155",
            }}
          >
            <span style={{ color: "#fbbf24", display: "flex" }}>
              <NavIcons.Calendar />
            </span>{" "}
            {currentDate}
          </div>
          <div
            style={{ width: "1px", height: "24px", background: "#334155" }}
          ></div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleRestore}
              style={{
                background: "transparent",
                color: "#fbbf24",
                border: "1px solid #fbbf24",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <NavIcons.Upload /> Restore
            </button>
            <button
              onClick={handleBackup}
              style={{
                background: "#fbbf24",
                color: "#0f172a",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 6px -1px rgba(251, 191, 36, 0.3)",
              }}
            >
              <NavIcons.Download /> Backup
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div
        style={{
          flex: 1,
          width: "100%",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {page === "gudang" && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Gudang onUpdate={() => setLastUpdate(Date.now())} />
          </div>
        )}

        {page === "kasir" && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Kasir
              products={products}
              onSuccess={() => setLastUpdate(Date.now())}
              cart={cart}
              setCart={setCart}
              pay={pay}
              setPay={setPay}
            />
          </div>
        )}

        {page === "laporan" && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Laporan />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;