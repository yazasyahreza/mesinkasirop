import { useState, useEffect } from "react";
import { DailyReport } from "../types";

// --- KOLEKSI IKON SVG CLEAN ---
const Icons = {
  Chart: () => (
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Refresh: () => (
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
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Receipt: () => (
    <svg
      width="32"
      height="32"
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
  Money: () => (
    <svg
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Trending: () => (
    <svg
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Lightbulb: () => (
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
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 9.5 6 4.65 4.65 0 0 0 8 11.5c0 1.3 1.09 2.2 1.49 2.5z" />
    </svg>
  ),
};

export default function Laporan() {
  const [report, setReport] = useState<DailyReport>({
    total_transaction: 0,
    total_omset: 0,
    total_profit: 0,
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    // @ts-ignore
    const data = await window.api.fetchTodayReport();
    setReport(data);
  };

  // Komponen Kartu Statistik
  const StatCard = ({ title, value, subtext, color, icon }: any) => (
    <div
      style={{
        background: color,
        color: "white",
        padding: "25px 30px", // [UBAH] Padding dalam lebih besar
        borderRadius: "16px",
        flex: 1,
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        minWidth: "220px", // Mencegah kartu terlalu gepeng
        transition: "transform 0.2s",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            opacity: 0.9,
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            letterSpacing: "-1px",
          }}
        >
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: "0.85rem", marginTop: "8px", opacity: 0.85 }}>
            {subtext}
          </div>
        )}
      </div>
      <div style={{ opacity: 0.25, transform: "scale(1.1)" }}>{icon}</div>
    </div>
  );

  return (
    // [UBAH] Padding Container menjadi 30px (Memberi jarak dari tepi layar)
    <div
      className="main-grid"
      style={{
        display: "block",
        width: "100%",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER: Margin Bawah 30px */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <h2
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "15px",
            color: "#0f172a",
            fontSize: "1.6rem",
          }}
        >
          <div
            style={{
              color: "#2563eb",
              background: "#eff6ff",
              padding: "10px",
              borderRadius: "10px",
              display: "flex",
            }}
          >
            <Icons.Chart />
          </div>
          Laporan Hari Ini ({new Date().toLocaleDateString("id-ID")})
        </h2>

        <button
          onClick={loadReport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 20px",
            background: "white",
            color: "#475569",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.95rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Icons.Refresh /> Refresh Data
        </button>
      </div>

      {/* DASHBOARD CARDS: Gap diperbesar menjadi 30px */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="Total Transaksi"
          value={report.total_transaction}
          color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          icon={<Icons.Receipt />}
        />

        <StatCard
          title="Omset Penjualan"
          value={`Rp ${report.total_omset.toLocaleString("id-ID")}`}
          color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          icon={<Icons.Money />}
        />

        <StatCard
          title="Keuntungan Bersih"
          value={`Rp ${report.total_profit.toLocaleString("id-ID")}`}
          subtext="*(Jual - Modal) x Terjual"
          color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          icon={<Icons.Trending />}
        />
      </div>

      {/* TIPS SECTION: Diberi padding dan margin yang lega */}
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#1e293b",
            fontSize: "1.2rem",
          }}
        >
          <div style={{ color: "#f59e0b" }}>
            <Icons.Lightbulb />
          </div>
          Tips Bisnis
        </h3>
        <ul
          style={{
            color: "#475569",
            lineHeight: "1.8",
            paddingLeft: "25px",
            margin: 0,
            fontSize: "1rem",
          }}
        >
          <li style={{ marginBottom: "8px" }}>
            Pastikan input <strong>Harga Modal</strong> pada setiap barang agar
            laporan Laba akurat.
          </li>
          <li style={{ marginBottom: "8px" }}>
            Data di atas otomatis ter-reset setiap ganti hari (jam 00:00).
          </li>
          <li>
            Laba dihitung dari:{" "}
            <code>(Harga Jual - Harga Modal) x Jumlah Terjual</code>.
          </li>
        </ul>
      </div>
    </div>
  );
}
