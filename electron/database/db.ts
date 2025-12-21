import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

// Ganti nama file ke V3 agar struktur baru terbentuk
const dbPath = path.join(app.getPath("userData"), "toko-ayah-v3.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initDB() {
  // 1. Tabel Produk (Tambah cost_price/modal)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      cost_price INTEGER DEFAULT 0,  -- [BARU] Harga Beli
      price INTEGER NOT NULL,        -- Harga Jual
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  // [MIGRASI OTOMATIS] Tambahkan Kolom Baru
  try {
    db.exec("ALTER TABLE products ADD COLUMN category TEXT");
  } catch (e) {
    /* Abaikan jika kolom sudah ada */
  }

  try {
    db.exec("ALTER TABLE products ADD COLUMN item_number TEXT");
  } catch (e) {
    /* Abaikan jika kolom sudah ada */
  }

  // 2. Tabel Transaksi
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount INTEGER DEFAULT 0,
      total_profit INTEGER DEFAULT 0, -- [BARU] Simpan total keuntungan per struk
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  // 3. Tabel Detail (Simpan snapshot harga beli saat transaksi terjadi)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER,
      product_id INTEGER,
      qty INTEGER,
      price_at_transaction INTEGER,
      cost_at_transaction INTEGER, -- [BARU] Penting untuk laporan laba rugi akurat
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `
  ).run();
}

// --- FUNGSI CRUD ---

export function getProducts() {
  try {
    return db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  } catch (e) {
    return [];
  }
}

export function addProduct(p: any) {
  try {
    // [UPDATE] Tambahkan category & item_number
    const stmt = db.prepare(
      "INSERT INTO products (barcode, name, cost_price, price, stock, category, item_number) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    // Pastikan string kosong jika data undefined
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
    // [UPDATE] Tambahkan category & item_number
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
    const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- FUNGSI TRANSAKSI (UPDATE LOGIKA LABA) ---

export function createTransaction(items: any[], totalAmount: number) {
  const executeTx = db.transaction(() => {
    // 1. Hitung Total Modal & Profit
    let totalCost = 0;
    items.forEach((item) => {
      totalCost += item.cost_price * item.qty;
    });
    const totalProfit = totalAmount - totalCost;

    // 2. Simpan Header Transaksi
    const stmtHeader = db.prepare(
      "INSERT INTO transactions (total_amount, total_profit, payment_date) VALUES (?, ?, ?)"
    );
    const info = stmtHeader.run(
      totalAmount,
      totalProfit,
      new Date().toISOString()
    );
    const txId = info.lastInsertRowid;

    // 3. Simpan Detail & Kurangi Stok
    const stmtDetail = db.prepare(
      "INSERT INTO transaction_items (transaction_id, product_id, qty, price_at_transaction, cost_at_transaction) VALUES (?, ?, ?, ?, ?)"
    );
    const stmtUpdateStock = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?"
    );

    for (const item of items) {
      const updateResult = stmtUpdateStock.run(item.qty, item.id, item.qty);
      if (updateResult.changes === 0)
        throw new Error(`Stok kurang: ${item.name}`);

      // Simpan harga jual DAN harga beli saat itu
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

// --- FUNGSI RIWAYAT & LAPORAN ---

export function getTransactions() {
  try {
    return db
      .prepare("SELECT * FROM transactions ORDER BY payment_date DESC")
      .all();
  } catch (e) {
    return [];
  }
}

export function getTransactionDetails(id: number) {
  try {
    return db
      .prepare(
        `
      SELECT ti.*, p.name as product_name 
      FROM transaction_items ti
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ?
    `
      )
      .all(id);
  } catch (e) {
    return [];
  }
}

export function deleteTransaction(id: number) {
  const executeTx = db.transaction(() => {
    db.prepare("DELETE FROM transaction_items WHERE transaction_id = ?").run(
      id
    );
    const info = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
    return info.changes > 0;
  });
  try {
    return { success: executeTx() };
  } catch (e: any) {
    return { success: false };
  }
}

export function getTransactionsByRange(startDate: string, endDate: string) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM transactions 
      WHERE date(payment_date) BETWEEN ? AND ? 
      ORDER BY payment_date DESC
    `);
    return stmt.all(startDate, endDate);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Laporan Penjualan Hari Ini
export function getTodayReport() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const stmt = db.prepare(`
      SELECT 
        COUNT(id) as total_transaction,
        COALESCE(SUM(total_amount), 0) as total_omset,
        COALESCE(SUM(total_profit), 0) as total_profit
      FROM transactions 
      WHERE date(payment_date) = ?
    `);
    return stmt.get(today);
  } catch (e) {
    return { total_transaction: 0, total_omset: 0, total_profit: 0 };
  }
}
