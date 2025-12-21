import { contextBridge, ipcRenderer } from "electron";

// Kita membuat API khusus untuk Frontend
const api = {
  // Fungsi untuk meminta data produk
  fetchProducts: () => ipcRenderer.invoke("get-products"),

  // Fungsi untuk menambah produk baru
  createProduct: (product: any) => ipcRenderer.invoke("add-product", product),

  // Fungsi untuk mengedit data produk
  updateProduct: (id: number, product: any) =>
    ipcRenderer.invoke("update-product", { id, product }),

  // Fungsi untuk menghapus data produk
  deleteProduct: (id: number) => ipcRenderer.invoke("delete-product", id),

  // Fungsi bayar
  createTransaction: (items: any[], total: number) =>
    ipcRenderer.invoke("create-transaction", { items, total }),

  // Fungsi riwayat
  fetchTransactions: () => ipcRenderer.invoke("get-transactions"),
  fetchTransactionDetails: (id: number) =>
    ipcRenderer.invoke("get-transaction-details", id),

  // Fungsi hapus riwayat
  deleteTransaction: (id: number) =>
    ipcRenderer.invoke("delete-transaction", id),

  // Fungsi cari data berdasarkan rentang tanggal
  fetchTransactionsByRange: (start: string, end: string) =>
    ipcRenderer.invoke("get-transactions-range", { start, end }),

  fetchTodayReport: () => ipcRenderer.invoke("get-today-report"),

  // Fungsi backup data
  backupDatabase: () => ipcRenderer.invoke("backup-db"),

  // Fungsi restore data
  restoreDatabase: () => ipcRenderer.invoke("restore-db"),
};

// Mengekspos API ke dunia luar (Window)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (ignore error types untuk fallback)
  window.api = api;
}
