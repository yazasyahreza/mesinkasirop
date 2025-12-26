import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";

import {
  initDB,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  createTransaction,
  getTodayReport,
  getTodayTransactions,
  getWeeklyReport, // [BARU]
  getMonthlyReport, // [BARU]
  db,
  dbPath,
} from "./database/db";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  win.maximize();
  win.show();

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // 1. Inisialisasi Database
  initDB();

  // 3. Setup IPC Handlers
  ipcMain.handle("fetch-products", async () => {
    return getProducts();
  });

  ipcMain.handle("create-product", async (_event, product) => {
    return addProduct(product);
  });

  ipcMain.handle("update-product", async (_event, id, product) => {
    return updateProduct(id, product);
  });

  ipcMain.handle("delete-product", async (_event, id) => {
    const { response } = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Batal", "Hapus"],
      defaultId: 1,
      cancelId: 0,
      title: "Konfirmasi Hapus",
      message: "Yakin ingin menghapus barang ini?",
      detail: "Data yang dihapus tidak bisa dikembalikan.",
    });

    if (response === 0) return { success: false };
    return deleteProduct(id);
  });

  // [UPDATE] Handler Transaction menerima parameter tambahan
  ipcMain.handle(
    "create-transaction",
    async (_event, items, total, discount, paymentMethod) => {
      return createTransaction(items, total, discount, paymentMethod);
    }
  );

  ipcMain.handle(
    "confirm-payment",
    async (_event, { total, bayar, kembalian }) => {
      const { response } = await dialog.showMessageBox({
        type: "question",
        buttons: ["Batal", "Bayar"],
        defaultId: 1,
        cancelId: 0,
        title: "Konfirmasi Pembayaran",
        message: "Lanjutkan proses pembayaran?",
        detail: `Total Tagihan:\t ${total}\nUang Diterima:\t ${bayar}\nKembalian:\t ${kembalian}`,
        noLink: true,
      });
      return response === 1;
    }
  );

  ipcMain.handle("fetch-today-report", async () => {
    return getTodayReport();
  });

  ipcMain.handle("fetch-today-transactions", async () => {
    return getTodayTransactions();
  });

  ipcMain.handle("backup-database", async () => {
    const { filePath } = await dialog.showSaveDialog({
      title: "Backup Database Toko",
      defaultPath: `Backup_Toko_Ayah_${new Date()
        .toISOString()
        .slice(0, 10)}.db`,
      filters: [{ name: "Database Files", extensions: ["db"] }],
    });

    if (!filePath) return { success: false };

    try {
      await db.backup(filePath);
      await dialog.showMessageBox({
        type: "info",
        title: "Backup Berhasil",
        message: "Data toko berhasil disimpan!",
        detail: `Lokasi: ${filePath}`,
      });
      return { success: true };
    } catch (e: any) {
      dialog.showErrorBox("Backup Gagal", e.message);
      return { success: false, msg: e.message };
    }
  });

  ipcMain.handle("restore-database", async () => {
    const { response } = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Batal", "Pilih File Backup"],
      defaultId: 0,
      cancelId: 0,
      title: "⚠️ PERINGATAN RESTORE",
      message: "Restore akan menimpa SEMUA data saat ini!",
      detail:
        "Pastikan Anda memilih file backup yang benar. Aplikasi akan restart otomatis setelah restore.",
    });

    if (response === 0) return { success: false };

    const { filePaths } = await dialog.showOpenDialog({
      title: "Pilih File Backup (.db)",
      properties: ["openFile"],
      filters: [{ name: "Database Files", extensions: ["db"] }],
    });

    if (!filePaths || filePaths.length === 0) return { success: false };

    const backupFile = filePaths[0];

    try {
      db.close();
      fs.copyFileSync(backupFile, dbPath);
      app.relaunch();
      app.exit();
      return { success: true };
    } catch (e: any) {
      dialog.showErrorBox(
        "Restore Gagal",
        "Pastikan file tidak sedang digunakan.\n" + e.message
      );
      return { success: false, msg: e.message };
    }
  });

  // [BARU] Handler Laporan Mingguan
  ipcMain.handle("fetch-weekly-report", async () => {
    return getWeeklyReport();
  });

  // [BARU] Handler Laporan Bulanan
  ipcMain.handle("fetch-monthly-report", async () => {
    return getMonthlyReport();
  });

  createWindow();
});
