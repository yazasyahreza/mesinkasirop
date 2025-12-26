import { useState, useEffect } from "react";
import { DailyReport, Transaction } from "../types";

// --- ICONS ---
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
  Calendar: () => (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Wallet: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20 7h-7" />
      <path d="M14 11h6" />
      <path d="M2 17v-2a2 2 0 0 1 2-2h16v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2" />
      <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
    </svg>
  ),
  Qr: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
    </svg>
  ),
  Card: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
};

export default function Laporan() {
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily");

  // State Data
  const [report, setReport] = useState<DailyReport>({
    total_transaction: 0,
    gross_sales: 0,
    total_discount: 0,
    net_sales: 0,
    total_profit: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [periodData, setPeriodData] = useState<any[]>([]);

  // State Filter
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString()
  );
  const [filterMonth, setFilterMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );

  useEffect(() => {
    setPeriodData([]);
    loadData();
  }, [mode]);

  const loadData = async () => {
    try {
      if (mode === "daily") {
        // @ts-ignore
        const stats = await window.api.fetchTodayReport();
        if (stats) setReport(stats);
        // @ts-ignore
        const trans = await window.api.fetchTodayTransactions();
        if (trans) setTransactions(trans);
      } else if (mode === "weekly") {
        // @ts-ignore
        const data = await window.api.fetchWeeklyReport();
        setPeriodData(data || []);
      } else if (mode === "monthly") {
        // @ts-ignore
        const data = await window.api.fetchMonthlyReport();
        setPeriodData(data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- LOGIKA FILTERING ---
  const filteredPeriodData = periodData.filter((item) => {
    if (!item) return false;
    const isYearMatch = item.period_id.startsWith(filterYear);
    if (mode === "monthly") return isYearMatch;
    if (mode === "weekly") {
      if (!item.start_date) return false;
      const itemMonth = item.start_date.split("-")[1];
      return isYearMatch && itemMonth === filterMonth;
    }
    return isYearMatch;
  });

  const getMethodColor = (m: string) => {
    if (m === "QRIS") return { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" };
    if (m === "DEBIT")
      return { bg: "rgba(168, 85, 247, 0.2)", text: "#c084fc" };
    return { bg: "rgba(16, 185, 129, 0.2)", text: "#4ade80" };
  };

  const getWeekLabel = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekInMonth = Math.ceil(day / 7);
    const monthName = date.toLocaleDateString("id-ID", { month: "long" });
    return `Minggu ke-${weekInMonth} (${monthName})`;
  };

  const StatCard = ({ title, value, subtext, gradient, icon }: any) => (
    <div
      style={{
        background: gradient,
        color: "white",
        padding: "16px",
        borderRadius: "12px",
        flex: 1,
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

  // --- REPORT CARD (DIPERBAIKI BAGIAN BAWAHNYA) ---
  const ReportCard = ({
    data,
    type,
  }: {
    data: any;
    type: "weekly" | "monthly";
  }) => (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        border: "1px solid #334155",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)",
        transition: "transform 0.2s",
      }}
    >
      {/* 1. Header Tanggal */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: "bold",
            }}
          >
            {type === "weekly" ? getWeekLabel(data.start_date) : "Periode"}
          </div>
          <div
            style={{
              fontSize: "1rem",
              color: "#f8fafc",
              fontWeight: "bold",
              marginTop: "4px",
            }}
          >
            {type === "weekly" && data.start_date && data.end_date
              ? `${data.start_date} s/d ${data.end_date}`
              : data.label}
          </div>
        </div>
        <div
          style={{
            background: "#334155",
            padding: "8px",
            borderRadius: "8px",
            color: "#fbbf24",
          }}
        >
          <Icons.Calendar />
        </div>
      </div>

      <div style={{ height: "1px", background: "#334155" }}></div>

      {/* 2. Rincian Metode Pembayaran */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.5)",
          borderRadius: "8px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#94a3b8",
            textTransform: "uppercase",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          Rincian Pendapatan
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "#cbd5e1",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#4ade80" }}>
              <Icons.Wallet />
            </span>{" "}
            Tunai
          </div>
          <div style={{ fontWeight: "600" }}>
            Rp {data.tunai.toLocaleString("id-ID")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "#cbd5e1",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#60a5fa" }}>
              <Icons.Qr />
            </span>{" "}
            QRIS
          </div>
          <div style={{ fontWeight: "600" }}>
            Rp {data.qris.toLocaleString("id-ID")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "#cbd5e1",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#c084fc" }}>
              <Icons.Card />
            </span>{" "}
            Debit
          </div>
          <div style={{ fontWeight: "600" }}>
            Rp {data.debit.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* 3. Grid Pendapatan vs Pengeluaran */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          marginTop: "auto",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#94a3b8",
              marginBottom: "4px",
            }}
          >
            Total Pendapatan
          </div>
          <div
            style={{
              color: "#10b981",
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          >
            Rp {data.revenue.toLocaleString("id-ID")}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#94a3b8",
              marginBottom: "4px",
            }}
          >
            Total Pengeluaran
          </div>
          <div
            style={{
              color: "#f43f5e",
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          >
            Rp {data.expense.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* 4. Footer Keuntungan [DIPERBAIKI: SEDERHANA & RAPI] */}
      {/* Menggunakan border-top sebagai pemisah, bukan kotak background */}
      <div
        style={{
          marginTop: "5px",
          paddingTop: "10px",
          borderTop: "1px solid #334155",
        }}
      >
        <div
          style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: "4px" }}
        >
          Keuntungan Bersih
        </div>
        {/* Style disamakan dengan Total Pendapatan/Pengeluaran di atasnya */}
        <div
          style={{ color: "#fbbf24", fontWeight: "bold", fontSize: "0.95rem" }}
        >
          Rp {data.profit.toLocaleString("id-ID")}
        </div>
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
        padding: "20px",
        height: "100%",
        overflow: "hidden",
        background: "#0f172a",
        boxSizing: "border-box",
      }}
    >
      <style>{`.custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; } .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; } .laporan-row:hover { background-color: rgba(255, 255, 255, 0.05) !important; } .tab-btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; } .tab-btn.active { background: #fbbf24; color: #1e293b; } .tab-btn.inactive { background: #1e293b; color: #94a3b8; border: 1px solid #334155; } .tab-btn.inactive:hover { background: #334155; color: #f8fafc; } .filter-select { background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 8px 12px; borderRadius: 8px; outline: none; cursor: pointer; font-weight: bold; font-size: 0.85rem; }`}</style>

      {/* HEADER & CONTROLS */}
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
              Laporan Keuangan
            </h2>
            <p
              style={{
                margin: "2px 0 0 0",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              Pantau pendapatan dan keuntungan toko
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {mode !== "daily" && (
              <select
                className="filter-select"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
            {mode === "weekly" && (
              <select
                className="filter-select"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            )}
            <div
              style={{
                display: "flex",
                gap: "5px",
                background: "#1e293b",
                padding: "4px",
                borderRadius: "10px",
                border: "1px solid #334155",
              }}
            >
              <button
                onClick={() => setMode("daily")}
                className={`tab-btn ${
                  mode === "daily" ? "active" : "inactive"
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => {
                  setMode("weekly");
                }}
                className={`tab-btn ${
                  mode === "weekly" ? "active" : "inactive"
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setMode("monthly")}
                className={`tab-btn ${
                  mode === "monthly" ? "active" : "inactive"
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARDS (DAILY) */}
        {mode === "daily" && (
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
              title="Omset Kotor"
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
              title="Omset Bersih"
              value={`Rp ${report.net_sales.toLocaleString("id-ID")}`}
              subtext="Uang Diterima"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              icon={<Icons.Money />}
            />
            <StatCard
              title="Laba Bersih"
              value={`Rp ${report.total_profit.toLocaleString("id-ID")}`}
              subtext="Real Profit"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              icon={<Icons.Trending />}
            />
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {mode === "daily" ? (
          <div
            style={{
              background: "#1e293b",
              borderRadius: "12px",
              border: "1px solid #334155",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              className="custom-scroll"
              style={{ overflowY: "auto", flex: "1" }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    {[
                      "Jam",
                      "Metode",
                      "Detail Barang",
                      "Kotor",
                      "Diskon",
                      "Bersih",
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
                          <span>Belum ada transaksi hari ini.</span>
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
                            {new Date(t.payment_date).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
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
        ) : (
          <div className="custom-scroll" style={{ overflowY: "auto", flex: 1 }}>
            {filteredPeriodData.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#64748b",
                  gap: "10px",
                  minHeight: "300px",
                }}
              >
                <Icons.Empty />
                <span>
                  Tidak ada laporan{" "}
                  {mode === "weekly" ? "pada bulan ini" : "pada tahun ini"}.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                  paddingBottom: "20px",
                }}
              >
                {filteredPeriodData.map((data, idx) => (
                  <ReportCard key={idx} data={data} type={mode} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
