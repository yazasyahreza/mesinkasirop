import { useState, useEffect } from "react";
import { DailyReport, Transaction } from "../types";

// --- KOLEKSI IKON SVG MODERN ---
const Icons = {
  Chart: () => (
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
      <path d="M3 3v18h18" />
      <path d="M18 9l-5-5-5 5-5-5" />
    </svg>
  ),
  Refresh: () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
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
      width="48"
      height="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
      width="48"
      height="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Trending: () => (
    <svg
      width="48"
      height="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Empty: () => (
    <svg
      width="64"
      height="64"
      fill="none"
      stroke="#475569"
      strokeWidth="1"
      viewBox="0 0 24 24"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
};

export default function Laporan() {
  const [report, setReport] = useState<DailyReport>({
    total_transaction: 0,
    total_omset: 0,
    total_profit: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // @ts-ignore
      const dataStats = await window.api.fetchTodayReport();
      if (dataStats) setReport(dataStats);

      // @ts-ignore
      const dataTrans = await window.api.fetchTodayTransactions();

      if (dataTrans && Array.isArray(dataTrans)) {
        const sorted = dataTrans.sort((a: any, b: any) => {
          const dateA = new Date(a.payment_date).getTime();
          const dateB = new Date(b.payment_date).getTime();
          return dateB - dateA;
        });
        setTransactions(sorted);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    }
  };

  const StatCard = ({ title, value, subtext, gradient, icon }: any) => (
    <div
      style={{
        background: gradient,
        color: "white",
        padding: "25px",
        borderRadius: "16px",
        flex: 1,
        minWidth: "240px",
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ zIndex: 1 }}>
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            opacity: 0.9,
            marginBottom: "8px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "2.2rem",
            fontWeight: "800",
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: "0.8rem",
              marginTop: "5px",
              opacity: 0.8,
              fontStyle: "italic",
            }}
          >
            {subtext}
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          right: "-5px",
          bottom: "-5px",
          opacity: 0.2,
          transform: "rotate(-10deg)",
        }}
      >
        {icon}
      </div>
    </div>
  );

  return (
    <div
      className="main-grid"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "30px",
        boxSizing: "border-box",
        height: "100%",
        overflow: "hidden",
        background: "#0f172a", // Background Dark Navy
      }}
    >
      {/* CSS Injection */}
      <style>
        {`
          .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; border: 2px solid #1e293b; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
          .laporan-row:hover { background-color: rgba(255, 255, 255, 0.05) !important; transition: background-color 0.2s ease; }
        `}
      </style>

      {/* --- HEADER --- */}
      <div style={{ flex: "0 0 auto", marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#f8fafc",
                fontSize: "1.8rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>Laporan Hari Ini</span>
            </h2>
            <p
              style={{
                margin: "5px 0 0 0",
                color: "#94a3b8",
                fontSize: "0.95rem",
              }}
            >
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={loadData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "transparent",
              color: "#f8fafc",
              border: "1px solid #475569",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#fbbf24")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#475569")}
          >
            <Icons.Refresh /> Refresh
          </button>
        </div>

        {/* --- CARDS SECTION (KEMBALI KE WARNA CERAH) --- */}
        <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
          {/* Biru Cerah */}
          <StatCard
            title="Total Transaksi"
            value={report.total_transaction}
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            icon={<Icons.Receipt />}
          />

          {/* Hijau Cerah */}
          <StatCard
            title="Omset Penjualan"
            value={`Rp ${report.total_omset.toLocaleString("id-ID")}`}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            icon={<Icons.Money />}
          />

          {/* Oranye Cerah */}
          <StatCard
            title="Keuntungan Bersih"
            value={`Rp ${report.total_profit.toLocaleString("id-ID")}`}
            subtext="*(Total Jual - Total Modal)"
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            icon={<Icons.Trending />}
          />
        </div>
      </div>

      {/* --- TABEL SECTION --- */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "#1e293b", // Container Dark Slate
          borderRadius: "16px",
          border: "1px solid #334155",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <div
          className="custom-scroll"
          style={{ overflowY: "auto", flex: "1", position: "relative" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                {["Jam", "Barang", "Harga", "Qty", "Subtotal", "Laba"].map(
                  (h, i) => (
                    <th
                      key={i}
                      style={{
                        background: "#0f172a", // Header Table Darker
                        textAlign:
                          i === 3 ? "center" : i > 1 ? "right" : "left",
                        padding: "18px 24px",
                        fontSize: "0.8rem",
                        color: "#cbd5e1",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "2px solid #334155",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "60px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Icons.Empty />
                      <span style={{ fontSize: "1rem" }}>
                        Belum ada transaksi hari ini.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t, index) => (
                  <tr
                    key={index}
                    className="laporan-row"
                    style={{ borderBottom: "1px solid #334155" }}
                  >
                    <td
                      style={{
                        padding: "16px 24px",
                        color: "#94a3b8",
                        fontSize: "0.95rem",
                      }}
                    >
                      {new Date(t.payment_date).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        fontWeight: "600",
                        color: "#f8fafc",
                        fontSize: "0.95rem",
                      }}
                    >
                      {t.product_name || (
                        <span style={{ color: "#ef4444", fontStyle: "italic" }}>
                          (Produk Dihapus)
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        textAlign: "right",
                        color: "#cbd5e1",
                      }}
                    >
                      Rp {t.price.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        textAlign: "center",
                        color: "#f8fafc",
                        fontWeight: "bold",
                      }}
                    >
                      {t.qty}
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#fbbf24",
                      }}
                    >
                      Rp {t.subtotal.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "16px 24px",
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#10b981",
                      }}
                    >
                      + Rp {t.profit.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
