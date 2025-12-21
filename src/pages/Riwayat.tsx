import { useState, useEffect } from "react";
import { Transaction, TransactionDetail } from "../types";

export default function Riwayat() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionDetail[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  // State untuk Filter Tanggal
  const [filter, setFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    // @ts-ignore
    const data = await window.api.fetchTransactions();
    setHistory(data);
  };

  const handleFilter = async () => {
    if (!filter.start || !filter.end)
      return alert("Pilih tanggal mulai & sampai!");
    // @ts-ignore
    const data = await window.api.fetchTransactionsByRange(
      filter.start,
      filter.end
    );
    setHistory(data);
  };

  const handleReset = () => {
    setFilter({ start: "", end: "" });
    loadHistory();
  };

  const loadDetails = async (id: number) => {
    setSelectedTxId(id);
    // @ts-ignore
    const details = await window.api.fetchTransactionDetails(id);
    setSelectedTx(details);
  };

  const handleDelete = async (id: number) => {
    // LANGSUNG HAPUS TANPA CONFIRM POPUP (Agar input tidak freeze)
    // @ts-ignore
    const res = await window.api.deleteTransaction(id);
    if (res.success) {
      setSelectedTxId(null);
      // Refresh data sesuai kondisi filter saat ini
      if (filter.start && filter.end) handleFilter();
      else loadHistory();
    }
  };

  return (
    <div className="main-grid" style={{ gridTemplateColumns: "400px 1fr" }}>
      {/* SIDEBAR: DAFTAR TRANSAKSI */}
      <div
        className="sidebar"
        style={{
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #ddd",
            background: "#f8fafc",
          }}
        >
          <h3 style={{ marginTop: 0 }}>📜 Riwayat Penjualan</h3>

          {/* FILTER TANGGAL */}
          <div
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "10px",
            }}
          >
            <small>Filter Tanggal:</small>
            <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
              <input
                type="date"
                value={filter.start}
                onChange={(e) =>
                  setFilter({ ...filter, start: e.target.value })
                }
                style={{ width: "50%" }}
              />
              <input
                type="date"
                value={filter.end}
                onChange={(e) => setFilter({ ...filter, end: e.target.value })}
                style={{ width: "50%" }}
              />
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={handleFilter}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "5px",
                  borderRadius: "4px",
                }}
              >
                Cari
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  background: "#e2e8f0",
                  color: "#333",
                  border: "none",
                  padding: "5px",
                  borderRadius: "4px",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#888" }}
            >
              Tidak ada data.
            </div>
          ) : (
            history.map((tx) => (
              <div
                key={tx.id}
                onClick={() => loadDetails(tx.id)}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  background: selectedTxId === tx.id ? "#eff6ff" : "white",
                  borderLeft:
                    selectedTxId === tx.id
                      ? "4px solid #2563eb"
                      : "4px solid transparent",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>#{tx.id}</strong>
                  <small>
                    {new Date(tx.payment_date).toLocaleString("id-ID")}
                  </small>
                </div>
                <div
                  style={{
                    color: "green",
                    fontWeight: "bold",
                    marginTop: "5px",
                  }}
                >
                  Rp {tx.total_amount.toLocaleString("id-ID")}
                </div>
                {/* Menampilkan Laba per struk (opsional) */}
                <small style={{ color: "#d97706" }}>
                  Laba: Rp {tx.total_profit.toLocaleString("id-ID")}
                </small>
              </div>
            ))
          )}
        </div>
      </div>

      {/* KONTEN: DETAIL TRANSAKSI */}
      <div className="content-area">
        {selectedTxId ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "2px solid #eee",
              }}
            >
              <h2>Detail Transaksi #{selectedTxId}</h2>
              <button
                onClick={() => selectedTxId && handleDelete(selectedTxId)}
                style={{
                  background: "#fee2e2",
                  color: "red",
                  border: "none",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                🗑️ Hapus Data
              </button>
            </div>

            {/* [PERBAIKAN] Styling Tabel Agar Sejajar */}
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Barang</th>
                  <th style={{ textAlign: "right" }}>Harga Jual</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedTx.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "left" }}>{item.product_name}</td>
                    <td style={{ textAlign: "right" }}>
                      Rp {item.price_at_transaction.toLocaleString("id-ID")}
                    </td>
                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      Rp{" "}
                      {(item.price_at_transaction * item.qty).toLocaleString(
                        "id-ID"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#ccc",
            }}
          >
            <h3>Pilih transaksi di kiri</h3>
          </div>
        )}
      </div>
    </div>
  );
}
