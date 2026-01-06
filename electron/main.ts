import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import express from "express";
import cors from "cors";
import ip from "ip";

import {
  initDB,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  createTransaction,
  getTodayReport,
  getTodayTransactions,
  getStockLogs,
  getMonthlyChart,
  getDailyHistory,
  getTopProductsByCategory,
  // [DIHAPUS] getHistoryByPlate
  db,
  dbPath,
} from "./database/db";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- URL GOOGLE SCRIPT ---
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzSiltxtE6zqtOAZKtUYXFPAXRYYgftWsL2_rMIdkdOaRM6KPTbvAk7lXdHM5V7Amsy/exec";

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
  initDB();

  // PRODUK
  ipcMain.handle("fetch-products", async () => getProducts());
  ipcMain.handle("add-product", async (_event, product) => addProduct(product));
  ipcMain.handle("edit-product", async (_event, id, product) =>
    updateProduct(id, product)
  );
  ipcMain.handle("delete-product", async (_event, id) => {
    try {
      return deleteProduct(id);
    } catch (err: any) {
      return { success: false, msg: err.message };
    }
  });

  // TRANSAKSI
  ipcMain.handle(
    "create-transaction",
    // [DIKEMBALIKAN KE 4 PARAMETER]
    async (_event, items, total, discount, paymentMethod) =>
      createTransaction(items, total, discount, paymentMethod)
  );

  // LAPORAN
  ipcMain.handle("fetch-today-report", async () => getTodayReport());
  ipcMain.handle("fetch-today-transactions", async () =>
    getTodayTransactions()
  );
  ipcMain.handle("fetch-daily-history", async () => getDailyHistory());

  // [BARU] Handler Stok & Grafik
  ipcMain.handle("fetch-stock-logs", async () => getStockLogs());
  ipcMain.handle("fetch-monthly-chart", async () => getMonthlyChart());

  // PRODUK TERLARIS
  ipcMain.handle("fetch-top-products", async () => getTopProductsByCategory());

  // [DIHAPUS] Handler fetch-history-by-plate

  // SYNC
  ipcMain.handle("sync-to-cloud", async () => {
    try {
      const todayReport: any = getTodayReport();
      const history: any = getDailyHistory();
      const todayData = history[0];
      if (!todayData)
        return { success: false, msg: "Belum ada transaksi hari ini." };

      const payload = {
        date: new Date().toLocaleDateString("id-ID"),
        total_trx: todayReport.total_transaction,
        gross_sales: todayReport.gross_sales,
        total_discount: todayReport.total_discount,
        net_sales: todayReport.net_sales,
        profit: todayReport.total_profit,
        tunai: todayData.tunai,
        qris: todayData.qris,
        debit: todayData.debit,
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
      });
      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        throw new Error("Respon Google bukan JSON.");
      }

      if (result.result === "success")
        return {
          success: true,
          msg: "Data berhasil terkirim ke Google Sheets!",
        };
      else
        throw new Error(
          "Google Script Error: " + (result.message || "Unknown")
        );
    } catch (error: any) {
      return { success: false, msg: error.message };
    }
  });

  // SYSTEM
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
      db.pragma("wal_checkpoint(RESTART)");
      fs.copyFileSync(dbPath, filePath);
      await dialog.showMessageBox({
        type: "info",
        title: "Backup Berhasil",
        message: "Data toko berhasil disimpan!",
        detail: `Lokasi: ${filePath}`,
      });
      return { success: true };
    } catch (e: any) {
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
    try {
      db.close();
      fs.copyFileSync(filePaths[0], dbPath);
      app.relaunch();
      app.exit();
      return { success: true };
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  });

  // ==========================================
  // [BARU] SERVER LOKAL UNTUK AKSES DARI HP
  // ==========================================
  const server = express();
  server.use(cors());
  server.use(express.json());

  const PORT = 3000;

  // 1. API Cek Koneksi
  // Tambahkan ': any' dan ganti 'req' jadi '_req' (agar tidak dianggap error unused)
  server.get("/", (_req: any, res: any) => {
    res.json({ status: "online", msg: "Halo dari Laptop Ayah!" });
  });

  // 2. API Ambil Produk
  // Ganti 'req' jadi '_req' karena kita tidak butuh data dari HP, cuma kirim balik
  server.get("/api/products", (_req: any, res: any) => {
    try {
      const products = getProducts();
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 3. API Tambah Barang
  // API UNTUK SIMPAN DATA DARI HP (BISA TAMBAH BARU / EDIT)
  server.post("/api/product/save", (req: any, res: any) => {
    try {
      const p = req.body;

      console.log("Menerima data dari HP:", p);

      if (p.id) {
        // JIKA ADA ID = EDIT BARANG LAMA
        const result = updateProduct(p.id, p);
        res.json(result);
      } else {
        // JIKA TIDAK ADA ID = TAMBAH BARANG BARU
        const result = addProduct(p);
        res.json(result);
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  server.get("/api/categories", (_req: any, res: any) => {
    try {
      // 1. Ambil semua produk
      const allProducts = getProducts();

      // 2. Ambil nama kategorinya saja, lalu buang yang duplikat pakai 'Set'
      // Hasilnya: ["Oli", "Ban", "Sparepart", ...] yang unik
      const uniqueCategories = [
        ...new Set(allProducts.map((p: any) => p.category)),
      ];

      // 3. Urutkan abjad A-Z biar rapi
      uniqueCategories.sort();

      res.json(uniqueCategories);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. API Hapus Barang
  server.delete("/api/product/:id", (req: any, res: any) => {
    try {
      const id = parseInt(req.params.id);

      // Pastikan fungsi 'deleteProduct' sudah di-import di paling atas file!
      const result = deleteProduct(id);

      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 5. API Cek Stok (Scan Barcode)
  server.get("/api/product/:barcode", (req: any, res: any) => {
    try {
      const all: any[] = getProducts();
      // Pastikan req.params.barcode terbaca
      const found = all.find((p: any) => p.barcode === req.params.barcode);
      if (found) res.json({ success: true, data: found });
      else res.json({ success: false, msg: "Barang tidak ditemukan" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Jalankan Server
  server.listen(PORT, "0.0.0.0", () => {
    // Kita gunakan require('ip') di sini jika import ip bermasalah,
    // atau biarkan seperti sebelumnya jika import sudah jalan.
    // console.log("Server HP Jalan...");

    // Agar aman dari error 'ip' yang mungkin belum ada types-nya:
    const ipAddress = ip.address();
    console.log(`SERVER HP BERJALAN DI: http://${ipAddress}:${PORT}`);

    setTimeout(() => {
      win?.webContents.send("server-ip", `http://${ipAddress}:${PORT}`);
    }, 3000);
  });

  createWindow();
});
