import { useState, useEffect } from "react";
import { DailyReport, Transaction, TopProduct } from "../types";

// --- ICONS ---
const Icons = {
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
  Cloud: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
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
  Loading: () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Expense: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Trophy: () => (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M8 21h8m-4-9v9m0-9a5 5 0 0 1-5-5V3h10v4a5 5 0 0 1-5 5z" />
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
};

export default function Laporan() {
  const [mode, setMode] = useState<"transaction" | "products" | "chart">(
    "transaction"
  );

  const [report, setReport] = useState<DailyReport>({
    total_transaction: 0,
    gross_sales: 0,
    total_discount: 0,
    net_sales: 0,
    total_profit: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [selectedRankCategory, setSelectedRankCategory] =
    useState<string>("Semua");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({ show: false, msg: "", type: "success" });

  useEffect(() => {
    loadData();
  }, [mode]);

  const loadData = async () => {
    try {
      // @ts-ignore
      const stats = await window.api.fetchTodayReport();
      if (stats) setReport(stats);

      if (mode === "transaction") {
        // @ts-ignore
        const trans = await window.api.fetchTodayTransactions();
        if (trans) setTransactions(trans);
      } else if (mode === "products") {
        // Load Stock Logs
        // @ts-ignore
        const logs = await window.api.fetchStockLogs();
        setStockLogs(logs || []);

        // Load Top Products
        // @ts-ignore
        const tops = await window.api.fetchTopProducts();
        setTopProducts(tops || []);
      } else if (mode === "chart") {
        // @ts-ignore
        const charts = await window.api.fetchMonthlyChart();
        setChartData(charts || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Logic Filter Peringkat
  const rankCategories = [
    "Semua",
    ...new Set(
      topProducts.map((p) => p.category).filter((c) => c && c.trim() !== "")
    ),
  ].sort();
  let displayedRankProducts = topProducts;
  if (selectedRankCategory !== "Semua") {
    displayedRankProducts = topProducts.filter(
      (p) => p.category === selectedRankCategory
    );
  }
  const limit = selectedRankCategory === "Semua" ? 5 : 3;
  const finalRankData = displayedRankProducts.slice(0, limit);

  const showNotification = (
    msg: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const initiateSync = () => setShowSyncModal(true);

  const confirmSync = async () => {
    setIsSyncing(true);
    try {
      // @ts-ignore
      const res = await window.api.syncToCloud();
      if (res.success) {
        showNotification("Laporan terkirim ke Google Sheets!", "success");
        setShowSyncModal(false);
      } else {
        showNotification("Gagal Sync: " + res.msg, "error");
        setShowSyncModal(false);
      }
    } catch (err) {
      showNotification("Terjadi kesalahan sistem", "error");
      setShowSyncModal(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const getMethodColor = (m: string) => {
    if (m === "QRIS") return { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" };
    if (m === "DEBIT")
      return { bg: "rgba(168, 85, 247, 0.2)", text: "#c084fc" };
    return { bg: "rgba(16, 185, 129, 0.2)", text: "#4ade80" };
  };

  const getLogTypeStyle = (type: string) => {
    if (type === "Barang Baru")
      return { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" };
    return { bg: "rgba(16, 185, 129, 0.2)", text: "#4ade80" };
  };

  const getHeaderContent = () => {
    switch (mode) {
      case "transaction":
        return {
          title: "Laporan Transaksi",
          subtitle: "Pantau detail penjualan dan omset harian.",
        };
      case "products":
        return {
          title: "Laporan Pergerakan Produk",
          subtitle:
            "Analisis barang masuk (stok) dan barang keluar (terlaris).",
        };
      case "chart":
        return {
          title: "Analisis Performa Toko",
          subtitle: "Grafik pendapatan dan keuntungan bulanan.",
        };
      default:
        return { title: "Laporan", subtitle: "" };
    }
  };
  const header = getHeaderContent();

  // --- KOMPONEN HELPER (DEFINISI DISINI AGAR TIDAK ERROR) ---

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

  const ProChart = ({ data }: { data: any[] }) => {
    const totalRev = data.reduce((a, b) => a + b.revenue, 0);
    const totalProf = data.reduce((a, b) => a + b.profit, 0);
    const totalExp = totalRev - totalProf;
    const rawMax = Math.max(...data.map((d) => d.revenue));
    const maxVal = rawMax === 0 ? 100000 : rawMax;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const roundedMax = Math.ceil(maxVal / magnitude) * magnitude * 1.3;
    const steps = 5;
    const svgWidth = 1000;
    const svgHeight = 450;
    const paddingLeft = 80;
    const paddingRight = 30;
    const paddingTop = 60;
    const paddingBottom = 50;
    const graphW = svgWidth - paddingLeft - paddingRight;
    const graphH = svgHeight - paddingTop - paddingBottom;
    const colWidth = graphW / data.length;
    const formatYLabel = (val: number) => {
      if (val === 0) return "0";
      if (val >= 1000000)
        return (val / 1000000).toFixed(1).replace(".0", "") + "jt";
      if (val >= 1000) return (val / 1000).toFixed(0) + "rb";
      return val.toString();
    };
    const formatBarLabel = (val: number) => {
      if (val === 0) return "";
      if (val >= 1000000) return (val / 1000000).toFixed(1) + "jt";
      if (val >= 1000) return (val / 1000).toFixed(0) + "k";
      return val.toString();
    };
    const getY = (val: number) => {
      const ratio = val / roundedMax;
      return paddingTop + graphH - ratio * graphH;
    };
    const revTrendPoints = data
      .map((d, i) => {
        const barW = colWidth * 0.3;
        const x = paddingLeft + i * colWidth + colWidth * 0.15 + barW / 2;
        const y = getY(d.revenue);
        return `${x},${y}`;
      })
      .join(" ");
    const expTrendPoints = data
      .map((d, i) => {
        const expense = d.revenue - d.profit;
        const barW = colWidth * 0.3;
        const x =
          paddingLeft + i * colWidth + colWidth * 0.15 + barW + 5 + barW / 2;
        const y = getY(expense);
        return `${x},${y}`;
      })
      .join(" ");
    const profitPoints = data
      .map((d, i) => {
        const x = paddingLeft + i * colWidth + colWidth / 2;
        const y = getY(d.profit);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              padding: "15px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                color: "#3b82f6",
              }}
            >
              <Icons.Money />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Total Omset (6 Bulan)
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#f8fafc",
                }}
              >
                Rp {totalRev.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              padding: "15px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                background: "rgba(251, 191, 36, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                color: "#fbbf24",
              }}
            >
              <Icons.Trending />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Total Keuntungan
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fbbf24",
                }}
              >
                Rp {totalProf.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              padding: "15px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                background: "rgba(236, 72, 153, 0.1)",
                padding: "10px",
                borderRadius: "8px",
                color: "#ec4899",
              }}
            >
              <Icons.Expense />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Total Modal (Pengeluaran)
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#ec4899",
                }}
              >
                Rp {totalExp.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            background: "#1e293b",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              color: "#f8fafc",
              fontWeight: "600",
              fontSize: "0.95rem",
            }}
          >
            Analisis Omset vs Pengeluaran
          </h4>
          <div style={{ width: "100%", height: "350px" }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="barPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {Array.from({ length: steps + 1 }).map((_, i) => {
                const val = (roundedMax / steps) * i;
                const y = getY(val);
                return (
                  <g key={i}>
                    <text
                      x={paddingLeft - 20}
                      y={y + 5}
                      fill="#64748b"
                      fontSize="14"
                      fontWeight="500"
                      textAnchor="end"
                    >
                      {formatYLabel(val)}
                    </text>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="8 8"
                      opacity="0.3"
                    />
                  </g>
                );
              })}
              <polyline
                points={revTrendPoints}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.5"
              />
              <polyline
                points={expTrendPoints}
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="6 6"
                opacity="0.5"
              />
              {data.map((d, i) => {
                const zeroY = getY(0);
                const expense = d.revenue - d.profit;
                const revY = getY(d.revenue);
                const expY = getY(expense);
                const revHeight = Math.max(zeroY - revY, 4);
                const expHeight = Math.max(zeroY - expY, 4);
                const x = paddingLeft + i * colWidth + colWidth * 0.15;
                const barW = colWidth * 0.3;
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={revY}
                      width={barW}
                      height={revHeight}
                      fill="url(#barBlue)"
                      rx="4"
                    />
                    <text
                      x={x + barW / 2}
                      y={revY - 10}
                      fill="#60a5fa"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {formatBarLabel(d.revenue)}
                    </text>
                    <rect
                      x={x + barW + 5}
                      y={expY}
                      width={barW}
                      height={expHeight}
                      fill="url(#barPink)"
                      rx="4"
                    />
                    <text
                      x={x + barW + 5 + barW / 2}
                      y={expY - 10}
                      fill="#f472b6"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {formatBarLabel(expense)}
                    </text>
                    <text
                      x={paddingLeft + i * colWidth + colWidth / 2}
                      y={svgHeight - 15}
                      fill="#cbd5e1"
                      fontSize="16"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
              <polyline
                points={profitPoints}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
              {data.map((d, i) => {
                const x = paddingLeft + i * colWidth + colWidth / 2;
                const y = getY(d.profit);
                return (
                  <g key={`dot-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#1e293b"
                      stroke="#fbbf24"
                      strokeWidth="3"
                    />
                    {d.profit > 0 && (
                      <text
                        x={x}
                        y={y - 15}
                        fill="#fbbf24"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}
                      >
                        {formatBarLabel(d.profit)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "25px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  background: "#3b82f6",
                  borderRadius: "3px",
                }}
              ></div>{" "}
              Pendapatan
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  background: "#ec4899",
                  borderRadius: "3px",
                }}
              ></div>{" "}
              Pengeluaran
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "4px",
                  background: "#fbbf24",
                  borderRadius: "2px",
                }}
              ></div>{" "}
              Keuntungan
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scroll::-webkit-scrollbar-track { background: transparent; } 
        .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; } 
        .laporan-row:hover { background-color: rgba(255, 255, 255, 0.05) !important; } 
        .tab-btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; } 
        .tab-btn.active { background: #fbbf24; color: #1e293b; } 
        .tab-btn.inactive { background: #1e293b; color: #94a3b8; border: 1px solid #334155; } 
        .tab-btn.inactive:hover { background: #334155; color: #f8fafc; } 
        .filter-select { background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 6px 12px; borderRadius: 8px; outline: none; cursor: pointer; font-size: 0.8rem; font-weight: 500; height: 32px; min-width: 150px; }
        .filter-select:hover { border-color: #475569; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
        .modal-content { background: #1e293b; border: 1px solid #334155; padding: 25px; borderRadius: 16px; width: 320px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); text-align: center; }
      `}</style>

      {/* TOAST */}
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
          transition: "all 0.4s",
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
            }}
          >
            {toast.type === "success" ? "BERHASIL" : "GAGAL"}
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>
            {toast.msg}
          </div>
        </div>
      </div>

      {/* CUSTOM MODAL SYNC */}
      {showSyncModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                color: "#10b981",
              }}
            >
              <Icons.Cloud />
            </div>
            <h3 style={{ margin: "0 0 8px 0", color: "#f8fafc" }}>
              Sync ke Cloud?
            </h3>
            <p
              style={{
                margin: "0 0 20px 0",
                color: "#94a3b8",
                fontSize: "0.9rem",
                lineHeight: "1.4",
              }}
            >
              Data hari ini akan dikirim ke Google Sheets. Pastikan koneksi
              internet lancar.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowSyncModal(false)}
                disabled={isSyncing}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "1px solid #475569",
                  color: "#cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmSync}
                disabled={isSyncing}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#10b981",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isSyncing ? <Icons.Loading /> : "Ya, Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              {header.title}
            </h2>
            <p
              style={{
                margin: "2px 0 0 0",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              {header.subtitle}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
              {mode === "transaction" && (
                <button
                  onClick={initiateSync}
                  style={{
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    marginRight: "5px",
                    transition: "0.2s",
                  }}
                  title="Kirim ke Google Sheets"
                >
                  <Icons.Cloud /> Sync
                </button>
              )}
              <button
                onClick={() => setMode("transaction")}
                className={`tab-btn ${
                  mode === "transaction" ? "active" : "inactive"
                }`}
              >
                Transaksi
              </button>
              <button
                onClick={() => setMode("products")}
                className={`tab-btn ${
                  mode === "products" ? "active" : "inactive"
                }`}
              >
                Produk
              </button>
              <button
                onClick={() => setMode("chart")}
                className={`tab-btn ${
                  mode === "chart" ? "active" : "inactive"
                }`}
              >
                Grafik
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        {mode === "transaction" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              marginBottom: "20px",
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

      {/* CONTENT AREA */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* --- TAB 1: TRANSAKSI (HARIAN) --- */}
        {mode === "transaction" && (
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
              style={{
                padding: "16px 20px",
                background: "#0f172a",
                borderBottom: "1px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  color: "#f8fafc",
                  fontWeight: "700",
                }}
              >
                Detail Transaksi Hari Ini
              </h3>
            </div>
            <div
              className="custom-scroll"
              style={{ overflowY: "auto", flex: "1" }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    {[
                      "JAM",
                      "METODE",
                      "DETAIL BARANG",
                      "KOTOR",
                      "DISKON",
                      "BERSIH",
                      "LABA",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          background: "#334155",
                          color: "#f8fafc",
                          padding: "14px 20px",
                          textAlign: i > 2 ? "right" : "left",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          borderBottom: "2px solid #334155",
                          letterSpacing: "0.5px",
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
                              padding: "12px 20px",
                              color: "#94a3b8",
                              fontSize: "0.85rem",
                            }}
                          >
                            {new Date(t.payment_date).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <span
                              style={{
                                background: style.bg,
                                color: style.text,
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                              }}
                            >
                              {t.payment_method || "TUNAI"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
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
                              padding: "12px 20px",
                              textAlign: "right",
                              color: "#cbd5e1",
                              fontSize: "0.85rem",
                            }}
                          >
                            Rp {t.gross_total.toLocaleString("id-ID")}
                          </td>
                          <td
                            style={{
                              padding: "12px 20px",
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
                              padding: "12px 20px",
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
                              padding: "12px 20px",
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
        )}

        {/* --- TAB 2: PRODUK (STOCK LOG & RANK) --- */}
        {mode === "products" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflow: "hidden",
            }}
          >
            {/* ATAS: TABEL BARANG MASUK */}
            <div
              style={{
                background: "#1e293b",
                borderRadius: "12px",
                border: "1px solid #334155",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                flex: "1 1 50%",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  background: "#0f172a",
                  borderBottom: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ color: "#10b981" }}>
                  <Icons.Box />
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    color: "#f8fafc",
                    fontWeight: "700",
                  }}
                >
                  Riwayat Barang Masuk (Stok)
                </h3>
              </div>
              <div
                className="custom-scroll"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Waktu
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Nama Barang
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "center",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Tipe
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "right",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Jumlah
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "0.85rem",
                          }}
                        >
                          Belum ada data barang masuk.
                        </td>
                      </tr>
                    ) : (
                      stockLogs.map((log, idx) => {
                        const typeStyle = getLogTypeStyle(log.log_type);
                        return (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #334155" }}
                          >
                            <td
                              style={{
                                padding: "10px 20px",
                                color: "#94a3b8",
                                fontSize: "0.8rem",
                              }}
                            >
                              {new Date(log.log_date).toLocaleString("id-ID")}
                            </td>
                            <td
                              style={{
                                padding: "10px 20px",
                                color: "#f8fafc",
                                fontSize: "0.85rem",
                                fontWeight: "500",
                              }}
                            >
                              {log.product_name}
                            </td>
                            <td
                              style={{
                                padding: "10px 20px",
                                textAlign: "center",
                              }}
                            >
                              <span
                                style={{
                                  background: typeStyle.bg,
                                  color: typeStyle.text,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "0.7rem",
                                  fontWeight: "bold",
                                }}
                              >
                                {log.log_type}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "10px 20px",
                                textAlign: "right",
                                color: "#10b981",
                                fontWeight: "bold",
                                fontSize: "0.85rem",
                              }}
                            >
                              + {log.qty_added}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAWAH: TABEL BARANG TERLARIS */}
            <div
              style={{
                background: "#1e293b",
                borderRadius: "12px",
                border: "1px solid #334155",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                flex: "1 1 50%",
              }}
            >
              <div
                style={{
                  padding: "12px 20px",
                  background: "#0f172a",
                  borderBottom: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div style={{ color: "#fbbf24" }}>
                    <Icons.Trophy />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      color: "#f8fafc",
                      fontWeight: "700",
                    }}
                  >
                    {selectedRankCategory === "Semua"
                      ? "Top 5 Barang Terlaris (Global)"
                      : `Top 3 Terlaris: ${selectedRankCategory}`}
                  </h3>
                </div>
                <select
                  className="filter-select"
                  value={selectedRankCategory}
                  onChange={(e) => setSelectedRankCategory(e.target.value)}
                >
                  <option value="Semua">Semua Kategori</option>
                  {rankCategories
                    .filter((c) => c !== "Semua")
                    .map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <div
                className="custom-scroll"
                style={{ overflowY: "auto", flex: 1 }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "center",
                          width: "50px",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Nama Barang
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Kategori
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "right",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Terjual
                      </th>
                      <th
                        style={{
                          background: "#334155",
                          color: "#94a3b8",
                          padding: "10px 20px",
                          textAlign: "right",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        Total Omset
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalRankData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "0.85rem",
                          }}
                        >
                          Belum ada data penjualan.
                        </td>
                      </tr>
                    ) : (
                      finalRankData.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #334155",
                            background:
                              idx === 0
                                ? "rgba(251, 191, 36, 0.05)"
                                : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 20px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                width: "20px",
                                height: "20px",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background:
                                  idx === 0
                                    ? "#fbbf24"
                                    : idx === 1
                                    ? "#94a3b8"
                                    : idx === 2
                                    ? "#b45309"
                                    : "#334155",
                                color: idx < 3 ? "#000" : "#cbd5e1",
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                              }}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td style={{ padding: "10px 20px" }}>
                            <div
                              style={{
                                color: "#f8fafc",
                                fontWeight: "500",
                                fontSize: "0.85rem",
                              }}
                            >
                              {item.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                marginTop: "2px",
                              }}
                            >
                              {item.brand ? (
                                <span style={{ marginRight: "8px" }}>
                                  {item.brand}
                                </span>
                              ) : (
                                ""
                              )}
                              Stok Sisa:{" "}
                              <span
                                style={{
                                  color:
                                    item.current_stock < 5
                                      ? "#ef4444"
                                      : "#10b981",
                                  fontWeight: "bold",
                                }}
                              >
                                {item.current_stock}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 20px" }}>
                            <span
                              style={{
                                background: "#0f172a",
                                color: "#cbd5e1",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                border: "1px solid #334155",
                              }}
                            >
                              {item.category || "-"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 20px",
                              textAlign: "right",
                              fontSize: "0.9rem",
                              fontWeight: "bold",
                              color: "#38bdf8",
                            }}
                          >
                            {item.total_sold}
                          </td>
                          <td
                            style={{
                              padding: "10px 20px",
                              textAlign: "right",
                              color: "#fbbf24",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            Rp {item.total_revenue.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: GRAFIK --- */}
        {mode === "chart" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <ProChart data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}
