import { contextBridge, ipcRenderer } from "electron";

const api = {
  // Produk
  fetchProducts: () => ipcRenderer.invoke("fetch-products"),
  createProduct: (product: any) =>
    ipcRenderer.invoke("create-product", product),
  updateProduct: (id: number, product: any) =>
    ipcRenderer.invoke("update-product", id, product),
  deleteProduct: (id: number) => ipcRenderer.invoke("delete-product", id),

  // Transaksi
  // [UPDATE] Menerima parameter discount dan paymentMethod
  createTransaction: (
    items: any[],
    total: number,
    discount: number,
    paymentMethod: string
  ) =>
    ipcRenderer.invoke(
      "create-transaction",
      items,
      total,
      discount,
      paymentMethod
    ),

  confirmPayment: (data: any) => ipcRenderer.invoke("confirm-payment", data),

  // Laporan
  fetchTodayReport: () => ipcRenderer.invoke("fetch-today-report"),
  fetchTodayTransactions: () => ipcRenderer.invoke("fetch-today-transactions"),

  fetchWeeklyReport: () => ipcRenderer.invoke("fetch-weekly-report"),
  fetchMonthlyReport: () => ipcRenderer.invoke("fetch-monthly-report"),

  // System
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
