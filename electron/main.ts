import fs from "fs";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
// Tambahkan createTransaction
import {
  initDB,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  createTransaction,
  getTransactions,
  getTransactionDetails,
  deleteTransaction,
  getTransactionsByRange,
  getTodayReport,
  db,
} from "./database/db";

// --- [INI SOLUSI ERROR TERMINAL ANDA] ---
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url); // <--- Baris ini yang dicari sistem
const __dirname = path.dirname(__filename);
// ----------------------------------------

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
  });

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
  // 1. Jalankan Database
  initDB();

  // 2. Setup IPC
  ipcMain.handle("get-products", () => getProducts());
  ipcMain.handle("add-product", (_event, product) => addProduct(product));

  // Update & Delete yang baru kita buat ditaruh DISINI:
  ipcMain.handle("update-product", (_event, { id, product }) =>
    updateProduct(id, product)
  );

  // Handler Hapus Produk (Full Native Dialog)
  ipcMain.handle("delete-product", async (_event, id) => {
    // 1. Dialog Konfirmasi (Sudah ada sebelumnya)
    const { response } = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Batal", "Hapus"],
      defaultId: 0,
      cancelId: 0,
      title: "Konfirmasi Hapus",
      message: "Yakin ingin menghapus barang ini?",
      detail: "Data stok barang ini akan hilang permanen dari database.",
    });

    if (response === 0) return { success: false };

    // 2. Jalankan Hapus
    const res = deleteProduct(id);

    // 3. [BARU] Jika Gagal, Backend yang memunculkan Dialog Error (Native)
    // Ini AMAN, tidak akan membuat input macet.
    if (!res.success) {
      const isForeignKey = res.error && res.error.includes("FOREIGN KEY");

      await dialog.showMessageBox({
        type: "error", // Ikon Silang Merah
        title: "Gagal Menghapus",
        message: "Barang ini tidak dapat dihapus!",
        detail: isForeignKey
          ? "Barang ini sudah tercatat dalam Riwayat Transaksi.\nMenghapusnya akan merusak Laporan Keuangan."
          : res.error || "Terjadi kesalahan database.",
      });
    }

    return res;
  });

  // Handler Pembayaran
  ipcMain.handle("create-transaction", (_event, { items, total }) => {
    return createTransaction(items, total);
  });

  // Handler Lihat Riwayat Transaksi
  ipcMain.handle("get-transactions", () => getTransactions());
  ipcMain.handle("get-transaction-details", (_event, id) =>
    getTransactionDetails(id)
  );

  // Handler Hapus Riwayat Transaksi
  ipcMain.handle("delete-transaction", (_event, id) => deleteTransaction(id));

  // Handler Filter Tanggal
  ipcMain.handle("get-transactions-range", (_event, { start, end }) => {
    return getTransactionsByRange(start, end);
  });

  ipcMain.handle("get-today-report", () => getTodayReport());

  // 1. HANDLER BACKUP (DENGAN NATIVE DIALOG)
  ipcMain.handle("backup-db", async () => {
    // [BARU] Tanya Konfirmasi via Native Dialog (Anti-Freeze)
    const { response } = await dialog.showMessageBox({
      type: "question",
      buttons: ["Batal", "Ya, Backup"],
      defaultId: 1,
      cancelId: 0,
      title: "Konfirmasi Backup",
      message: "Apakah Anda ingin mem-backup database Toko Ayah sekarang?",
      detail: "Pastikan Anda memilih folder yang aman (seperti Google Drive).",
    });

    // Jika user pilih Batal (indeks 0), berhenti.
    if (response === 0) return { success: false, msg: "Dibatalkan" };

    // Lanjut pilih folder
    const result = await dialog.showOpenDialog({
      title: "Pilih Folder Penyimpanan",
      properties: ["openDirectory"],
    });

    if (result.canceled) return { success: false, msg: "Dibatalkan" };

    const destinationFolder = result.filePaths[0];
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}_${String(
      date.getHours()
    ).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
    const fileName = `backup-toko-${timestamp}.db`;
    const destinationPath = path.join(destinationFolder, fileName);

    try {
      await db.backup(destinationPath);

      // [BARU] Tampilkan Pesan Sukses dari sini juga
      await dialog.showMessageBox({
        type: "info",
        title: "Backup Berhasil",
        message: `Data berhasil diamankan!\nLokasi: ${destinationPath}`,
      });

      return { success: true, path: destinationPath };
    } catch (error: any) {
      dialog.showErrorBox("Gagal Backup", error.message);
      return { success: false, msg: error.message };
    }
  });

  // 2. HANDLER RESTORE (DENGAN NATIVE DIALOG)
  ipcMain.handle("restore-db", async () => {
    // [BARU] Warning Keras via Native Dialog
    const { response } = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Batal", "Lanjutkan Restore"],
      defaultId: 0,
      cancelId: 0,
      title: "⚠️ PERINGATAN KERAS",
      message: "Apakah Anda yakin ingin me-Restore database?",
      detail:
        "Data toko saat ini akan DITIMPA & HILANG permanen. Aplikasi akan RESTART otomatis.",
    });

    if (response === 0) return { success: false, msg: "Dibatalkan" };

    const result = await dialog.showOpenDialog({
      title: "Pilih File Backup (.db)",
      filters: [{ name: "Database", extensions: ["db"] }],
      properties: ["openFile"],
    });

    if (result.canceled) return { success: false, msg: "Dibatalkan" };

    const sourcePath = result.filePaths[0];
    const dbFolder = app.getPath("userData");
    const dbPath = path.join(dbFolder, "toko-ayah-v3.db");
    const walPath = path.join(dbFolder, "toko-ayah-v3.db-wal");
    const shmPath = path.join(dbFolder, "toko-ayah-v3.db-shm");

    try {
      db.close();

      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

      fs.copyFileSync(sourcePath, dbPath);

      // Restart
      if (app.isPackaged) {
        app.relaunch();
      } else {
        app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
      }
      app.exit(0);

      return { success: true };
    } catch (error: any) {
      dialog.showErrorBox("Gagal Restore", error.message);
      return { success: false, msg: error.message };
    }
  });

  createWindow();
});
