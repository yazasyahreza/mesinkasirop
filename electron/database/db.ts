import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

// Setup Path Database
const dbFolder = app.getPath("userData");
export const dbPath = path.join(dbFolder, "toko-ayah-v3.db");

// Koneksi Database
export const db = new Database(dbPath, { verbose: console.log });
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Helper Waktu Lokal
const getLocalTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset);
  return local.toISOString().slice(0, 19).replace("T", " ");
};

export function initDB() {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      cost_price INTEGER DEFAULT 0,
      price INTEGER NOT NULL,
      stock INTEGER DEFAULT 0,
      category TEXT,
      item_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount INTEGER DEFAULT 0,
      total_profit INTEGER DEFAULT 0,
      payment_date DATETIME 
    )
  `
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      product_id INTEGER,
      qty INTEGER,
      price_at_transaction INTEGER,
      cost_at_transaction INTEGER,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `
  ).run();
}

// [BARU] FUNGSI PEMBERSIH OTOMATIS (Hapus Data Kemarin & Lama)
export function autoClearOldData() {
  try {
    const execute = db.transaction(() => {
      // 1. Cari Transaksi yang BUKAN hari ini (< Hari Ini)
      // Kita pakai date('now', 'localtime') agar sesuai jam komputer user

      // Hapus Detail Barang (Items) milik transaksi lampau
      db.prepare(
        `
        DELETE FROM transaction_items 
        WHERE transaction_id IN (
          SELECT id FROM transactions 
          WHERE date(payment_date) < date('now', 'localtime')
        )
      `
      ).run();

      // Hapus Header Transaksi lampau
      const info = db
        .prepare(
          `
        DELETE FROM transactions 
        WHERE date(payment_date) < date('now', 'localtime')
      `
        )
        .run();

      return info.changes;
    });

    const deletedCount = execute();
    if (deletedCount > 0) {
      console.log(
        `[AUTO-CLEAN] Berhasil menghapus ${deletedCount} transaksi lama.`
      );
    }
    return { success: true };
  } catch (e: any) {
    console.error("[AUTO-CLEAN ERROR]", e);
    return { success: false, error: e.message };
  }
}

// --- GUDANG ---
export function getProducts() {
  try {
    return db.prepare("SELECT * FROM products ORDER BY name ASC").all();
  } catch (e) {
    return [];
  }
}

export function addProduct(p: any) {
  try {
    const stmt = db.prepare(
      "INSERT INTO products (barcode, name, cost_price, price, stock, category, item_number) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const info = stmt.run(
      p.barcode,
      p.name,
      p.cost_price,
      p.price,
      p.stock,
      p.category || "",
      p.item_number || ""
    );
    return { success: true, id: info.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function updateProduct(id: number, p: any) {
  try {
    const stmt = db.prepare(
      "UPDATE products SET barcode=?, name=?, cost_price=?, price=?, stock=?, category=?, item_number=? WHERE id=?"
    );
    const info = stmt.run(
      p.barcode,
      p.name,
      p.cost_price,
      p.price,
      p.stock,
      p.category || "",
      p.item_number || "",
      id
    );
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// [MODIFIKASI] HANYA BISA HAPUS JIKA TIDAK ADA DI TRANSAKSI
export function deleteProduct(id: number) {
  try {
    // 1. Cek apakah barang ada di transaksi (yang tersisa hari ini)
    const check = db
      .prepare(
        "SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?"
      )
      .get(id) as any;

    if (check.count > 0) {
      // JIKA ADA: Tolak penghapusan
      return {
        success: false,
        reason: "LOCKED", // Kode khusus untuk frontend
        msg: "Barang sedang digunakan dalam transaksi hari ini!",
      };
    }

    // 2. Jika aman, hapus barang
    const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- KASIR ---
export function createTransaction(items: any[], totalAmount: number) {
  const executeTx = db.transaction(() => {
    let totalCost = 0;
    items.forEach((item) => {
      totalCost += item.cost_price * item.qty;
    });
    const totalProfit = totalAmount - totalCost;

    const stmtHeader = db.prepare(
      "INSERT INTO transactions (total_amount, total_profit, payment_date) VALUES (?, ?, ?)"
    );
    const info = stmtHeader.run(totalAmount, totalProfit, getLocalTime());
    const txId = info.lastInsertRowid;

    const stmtDetail = db.prepare(
      "INSERT INTO transaction_items (transaction_id, product_id, qty, price_at_transaction, cost_at_transaction) VALUES (?, ?, ?, ?, ?)"
    );
    const stmtUpdateStock = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?"
    );

    for (const item of items) {
      const updateResult = stmtUpdateStock.run(item.qty, item.id, item.qty);
      if (updateResult.changes === 0) {
        throw new Error(`Stok kurang untuk barang: ${item.name}`);
      }
      stmtDetail.run(txId, item.id, item.qty, item.price, item.cost_price);
    }
    return txId;
  });

  try {
    const id = executeTx();
    return { success: true, id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- LAPORAN ---
export function getTodayReport() {
  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(id) as total_transaction,
        COALESCE(SUM(total_amount), 0) as total_omset,
        COALESCE(SUM(total_profit), 0) as total_profit
      FROM transactions 
      WHERE date(payment_date) = date('now', 'localtime')
    `);
    return stmt.get();
  } catch (e) {
    return { total_transaction: 0, total_omset: 0, total_profit: 0 };
  }
}

export function getTodayTransactions() {
  try {
    return db
      .prepare(
        `
      SELECT 
        t.payment_date,
        p.name as product_name,
        ti.price_at_transaction as price,
        ti.qty,
        (ti.price_at_transaction * ti.qty) as subtotal,
        ((ti.price_at_transaction - ti.cost_at_transaction) * ti.qty) as profit
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE date(t.payment_date) = date('now', 'localtime')
      ORDER BY t.payment_date DESC
    `
      )
      .all();
  } catch (e) {
    return [];
  }
}
