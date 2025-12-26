import { useState, useEffect } from "react";
import { DailyReport, Transaction } from "../types";

// --- KOLEKSI IKON ---
const Icons = {
  Refresh: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Receipt: () => (
    <svg
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Trending: () => (
    <svg
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Discount: () => (
    <svg
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
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
    gross_sales: 0,
    total_discount: 0,
    net_sales: 0,
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
      if (dataTrans) setTransactions(dataTrans);
    } catch (error) {
      console.error(error);
    }
  };

  // --- COMPONENT CARD YANG LEBIH COMPACT ---
  const StatCard = ({ title, value, subtext, gradient, icon }: any) => (
    <div
      style={{
        background: gradient,
        color: "white",
        padding: "16px", // Padding diperkecil (sebelumnya 20-25px)
        borderRadius: "12px",
        flex: 1,
        minWidth: "0", // Penting agar tidak memaksa lebar grid
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ zIndex: 1 }}>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            opacity: 0.9,
            marginBottom: "4px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            lineHeight: "1.2",
          }}
        >
          {value}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: "0.65rem",
              marginTop: "4px",
              opacity: 0.9,
              background: "rgba(0,0,0,0.2)",
              width: "fit-content",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            {subtext}
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          right: "-8px",
          bottom: "-8px",
          opacity: 0.2,
          transform: "rotate(-10deg) scale(1)",
        }}
      >
        {icon}
      </div>
    </div>
  );

  const getMethodColor = (m: string) => {
    if (m === "QRIS") return { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" };
    if (m === "DEBIT")
      return { bg: "rgba(168, 85, 247, 0.2)", text: "#c084fc" };
    return { bg: "rgba(16, 185, 129, 0.2)", text: "#4ade80" };
  };

  return (
    // Padding Container Utama dikurangi jadi 20px
    <div
      className="main-grid"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "20px",
        height: "100%",
        overflow: "hidden",
        background: "#0f172a",
        boxSizing: "border-box",
      }}
    >
      <style>{`.custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; } .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; } .laporan-row:hover { background-color: rgba(255, 255, 255, 0.05) !important; }`}</style>

      {/* HEADER */}
      <div style={{ flex: "0 0 auto", marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#f8fafc", fontSize: "1.5rem" }}>
              Laporan Hari Ini
            </h2>
            <p
              style={{
                margin: "2px 0 0 0",
                color: "#94a3b8",
                fontSize: "0.85rem",
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
              gap: "6px",
              padding: "8px 12px",
              background: "transparent",
              color: "#f8fafc",
              border: "1px solid #475569",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "0.2s",
              fontSize: "0.85rem",
            }}
          >
            <Icons.Refresh /> Refresh
          </button>
        </div>

        {/* STAT CARDS - GRID RAPAT (Gap diperkecil jadi 10px) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
          }}
        >
          <StatCard
            title="Total Transaksi"
            value={report.total_transaction}
            gradient="linear-gradient(135deg, #475569 0%, #334155 100%)"
            icon={<Icons.Receipt />}
          />
          <StatCard
            title="Total Omset Kotor"
            value={`Rp ${report.gross_sales.toLocaleString("id-ID")}`}
            subtext="Sebelum Diskon"
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            icon={<Icons.Money />}
          />
          <StatCard
            title="Total Diskon"
            value={`- Rp ${report.total_discount.toLocaleString("id-ID")}`}
            subtext="Potongan"
            gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
            icon={<Icons.Discount />}
          />
          <StatCard
            title="Total Omset Bersih"
            value={`Rp ${report.net_sales.toLocaleString("id-ID")}`}
            subtext="Uang Diterima"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            icon={<Icons.Money />}
          />
          <StatCard
            title="Total Laba"
            value={`Rp ${report.total_profit.toLocaleString("id-ID")}`}
            subtext="Real Profit"
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            icon={<Icons.Trending />}
          />
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "#1e293b",
          borderRadius: "12px",
          border: "1px solid #334155",
          overflow: "hidden",
        }}
      >
        <div className="custom-scroll" style={{ overflowY: "auto", flex: "1" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                {/* Header padding diperkecil */}
                {[
                  "Jam",
                  "Metode",
                  "Detail Barang",
                  "Omset Kotor",
                  "Diskon",
                  "Omset Bersih",
                  "Laba",
                ].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      background: "#0f172a",
                      textAlign: i > 2 ? "right" : "left",
                      padding: "12px 16px",
                      fontSize: "0.7rem",
                      color: "#cbd5e1",
                      fontWeight: "700",
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
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Icons.Empty />
                      <span>Belum ada transaksi.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t, index) => {
                  const style = getMethodColor(t.payment_method || "TUNAI");
                  return (
                    <tr
                      key={index}
                      className="laporan-row"
                      style={{ borderBottom: "1px solid #334155" }}
                    >
                      <td
                        style={{
                          padding: "10px 16px",
                          color: "#94a3b8",
                          fontSize: "0.85rem",
                        }}
                      >
                        {new Date(t.payment_date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span
                          style={{
                            background: style.bg,
                            color: style.text,
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontSize: "0.65rem",
                            fontWeight: "700",
                          }}
                        >
                          {t.payment_method || "TUNAI"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          color: "#f8fafc",
                          fontSize: "0.85rem",
                          maxWidth: "200px",
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={t.items_summary}
                        >
                          {t.items_summary}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          textAlign: "right",
                          color: "#cbd5e1",
                          fontSize: "0.85rem",
                        }}
                      >
                        Rp {t.gross_total.toLocaleString("id-ID")}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          textAlign: "right",
                          color: "#f472b6",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        {t.discount > 0
                          ? `- Rp ${t.discount.toLocaleString("id-ID")}`
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          textAlign: "right",
                          fontWeight: "700",
                          color: "#fbbf24",
                          fontSize: "0.9rem",
                        }}
                      >
                        Rp {t.net_total.toLocaleString("id-ID")}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          textAlign: "right",
                          fontWeight: "700",
                          color: t.profit < 0 ? "#ef4444" : "#10b981",
                          fontSize: "0.85rem",
                        }}
                      >
                        {t.profit < 0 ? "-" : "+"} Rp{" "}
                        {Math.abs(t.profit).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
