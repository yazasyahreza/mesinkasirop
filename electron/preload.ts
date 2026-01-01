import { contextBridge, ipcRenderer } from "electron";

const api = {
  // --- PRODUK ---
  fetchProducts: () => ipcRenderer.invoke("fetch-products"),
  addProduct: (product: any) => ipcRenderer.invoke("add-product", product),
  editProduct: (id: number, product: any) =>
    ipcRenderer.invoke("edit-product", id, product),
  deleteProduct: (id: number) => ipcRenderer.invoke("delete-product", id),

  // --- TRANSAKSI ---
  createTransaction: (
    items: any[],
    total: number,
    discount: number,
    paymentMethod: string
    // Parameter 'plate' SUDAH DIHAPUS
  ) =>
    ipcRenderer.invoke(
      "create-transaction",
      items,
      total,
      discount,
      paymentMethod
      // Argument 'plate' SUDAH DIHAPUS
    ),

  fetchTodayTransactions: () => ipcRenderer.invoke("fetch-today-transactions"),

  // --- LAPORAN ---
  fetchTodayReport: () => ipcRenderer.invoke("fetch-today-report"),
  fetchDailyHistory: () => ipcRenderer.invoke("fetch-daily-history"),

  // [PENTING] Handler ini sebelumnya hilang, makanya data kosong:
  fetchStockLogs: () => ipcRenderer.invoke("fetch-stock-logs"),
  fetchMonthlyChart: () => ipcRenderer.invoke("fetch-monthly-chart"),

  // (Opsional: Masih disimpan jika suatu saat butuh laporan lama)
  fetchWeeklyReport: () => ipcRenderer.invoke("fetch-weekly-report"),
  fetchMonthlyReport: () => ipcRenderer.invoke("fetch-monthly-report"),

  // --- PRODUK TERLARIS ---
  fetchTopProducts: () => ipcRenderer.invoke("fetch-top-products"),

  // [DIHAPUS] getHistoryByPlate

  // --- SYSTEM & SYNC ---
  syncToCloud: () => ipcRenderer.invoke("sync-to-cloud"),
  backupDatabase: () => ipcRenderer.invoke("backup-database"),
  restoreDatabase: () => ipcRenderer.invoke("restore-database"),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.api = api;
}
