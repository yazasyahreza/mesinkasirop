import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

// Setup Path Database
const dbFolder = app.getPath("userData");
export const dbPath = path.join(dbFolder, "toko-ayah-v7.db");

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

  // [UPDATE] Menambahkan kolom discount, final_amount, dan payment_method
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount INTEGER DEFAULT 0,
      discount INTEGER DEFAULT 0,       -- [BARU] Diskon
      final_amount INTEGER DEFAULT 0,   -- [BARU] Total Setelah Diskon
      total_profit INTEGER DEFAULT 0,
      payment_method TEXT DEFAULT 'TUNAI', -- [BARU] TUNAI, QRIS, DEBIT
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

export function deleteProduct(id: number) {
  try {
    // 1. Cek apakah barang ada di transaksi (yang tersisa hari ini)
    const check = db
      .prepare(
        "SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?"
      )
      .get(id) as any;

    if (check.count > 0) {
      return {
        success: false,
        reason: "LOCKED",
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
// [UPDATE] Menerima discount & paymentMethod
export function createTransaction(
  items: any[],
  totalAmount: number,
  discount: number,
  paymentMethod: string
) {
  const executeTx = db.transaction(() => {
    let totalCost = 0;
    items.forEach((item) => {
      totalCost += item.cost_price * item.qty;
    });

    // [LOGIKA BARU] Hitung Final Amount & Profit Bersih
    // Profit = (Total Jual - Diskon) - Total Modal
    const finalAmount = totalAmount - discount;
    const totalProfit = finalAmount - totalCost;

    const stmtHeader = db.prepare(
      "INSERT INTO transactions (total_amount, discount, final_amount, total_profit, payment_method, payment_date) VALUES (?, ?, ?, ?, ?, ?)"
    );

    // Masukkan data transaksi lengkap
    const info = stmtHeader.run(
      totalAmount,
      discount,
      finalAmount,
      totalProfit,
      paymentMethod,
      getLocalTime()
    );
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
        COALESCE(SUM(total_amount), 0) as gross_sales,   -- Total Kotor
        COALESCE(SUM(discount), 0) as total_discount,    -- Total Diskon
        COALESCE(SUM(final_amount), 0) as net_sales,     -- Total Bersih
        COALESCE(SUM(total_profit), 0) as total_profit   -- Laba Bersih
      FROM transactions 
      WHERE date(payment_date) = date('now', 'localtime')
    `);

    const result = stmt.get();
    return (
      result || {
        total_transaction: 0,
        gross_sales: 0,
        total_discount: 0,
        net_sales: 0,
        total_profit: 0,
      }
    );
  } catch (e) {
    return {
      total_transaction: 0,
      gross_sales: 0,
      total_discount: 0,
      net_sales: 0,
      total_profit: 0,
    };
  }
}

export function getTodayTransactions() {
  try {
    // Query ini menggabungkan item dalam satu baris transaksi
    return db
      .prepare(
        `
      SELECT 
        t.id,
        t.payment_date,
        t.payment_method,
        t.total_amount as gross_total,
        t.discount,
        t.final_amount as net_total,
        t.total_profit as profit,
        -- Menggabungkan nama barang: "Oli (x2), Busi (x1)"
        GROUP_CONCAT(p.name || ' (x' || ti.qty || ')', ', ') as items_summary
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE date(t.payment_date) = date('now', 'localtime')
      GROUP BY t.id
      ORDER BY t.payment_date DESC
    `
      )
      .all();
  } catch (e) {
    console.error(e);
    return [];
  }
}

// --- LAPORAN MINGGUAN & BULANAN ---

// --- LAPORAN MINGGUAN ---
export function getWeeklyReport() {
  try {
    return db
      .prepare(
        `
      SELECT 
        strftime('%Y-%W', payment_date) as period_id,
        date(payment_date, '-6 days', 'weekday 1') as start_date,
        date(payment_date, '-6 days', 'weekday 1', '+6 days') as end_date,
        
        -- Total Semua
        SUM(final_amount) as revenue,
        
        -- Rincian Metode Pembayaran
        SUM(CASE WHEN payment_method = 'TUNAI' THEN final_amount ELSE 0 END) as tunai,
        SUM(CASE WHEN payment_method = 'QRIS' THEN final_amount ELSE 0 END) as qris,
        SUM(CASE WHEN payment_method = 'DEBIT' THEN final_amount ELSE 0 END) as debit,

        SUM(final_amount - total_profit) as expense,
        SUM(total_profit) as profit
      FROM transactions
      GROUP BY period_id
      ORDER BY period_id DESC
      LIMIT 12
    `
      )
      .all();
  } catch (e) {
    return [];
  }
}

// --- LAPORAN BULANAN ---
export function getMonthlyReport() {
  try {
    return db
      .prepare(
        `
      SELECT 
        strftime('%Y-%m', payment_date) as period_id,
        CASE strftime('%m', payment_date)
          WHEN '01' THEN 'Januari ' || strftime('%Y', payment_date)
          WHEN '02' THEN 'Februari ' || strftime('%Y', payment_date)
          WHEN '03' THEN 'Maret ' || strftime('%Y', payment_date)
          WHEN '04' THEN 'April ' || strftime('%Y', payment_date)
          WHEN '05' THEN 'Mei ' || strftime('%Y', payment_date)
          WHEN '06' THEN 'Juni ' || strftime('%Y', payment_date)
          WHEN '07' THEN 'Juli ' || strftime('%Y', payment_date)
          WHEN '08' THEN 'Agustus ' || strftime('%Y', payment_date)
          WHEN '09' THEN 'September ' || strftime('%Y', payment_date)
          WHEN '10' THEN 'Oktober ' || strftime('%Y', payment_date)
          WHEN '11' THEN 'November ' || strftime('%Y', payment_date)
          WHEN '12' THEN 'Desember ' || strftime('%Y', payment_date)
        END as label,
        
        -- Total Semua
        SUM(final_amount) as revenue,

        -- Rincian Metode Pembayaran
        SUM(CASE WHEN payment_method = 'TUNAI' THEN final_amount ELSE 0 END) as tunai,
        SUM(CASE WHEN payment_method = 'QRIS' THEN final_amount ELSE 0 END) as qris,
        SUM(CASE WHEN payment_method = 'DEBIT' THEN final_amount ELSE 0 END) as debit,

        SUM(final_amount - total_profit) as expense,
        SUM(total_profit) as profit
      FROM transactions
      GROUP BY period_id
      ORDER BY period_id DESC
      LIMIT 12
    `
      )
      .all();
  } catch (e) {
    return [];
  }
}
