import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

// --- SETUP DATABASE ---
const dbFolder = app.getPath("userData");
export const dbPath = path.join(dbFolder, "ogeng-press.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const getLocalTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset);
  return local.toISOString().slice(0, 19).replace("T", " ");
};

export function initDB() {
  // 1. Buat Tabel Produk (Tetap ada image_url)
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
      brand TEXT,
      compatibility TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  ).run();

  // 2. MIGRASI OTOMATIS
  try {
    db.prepare("ALTER TABLE products ADD COLUMN brand TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE products ADD COLUMN compatibility TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE products ADD COLUMN image_url TEXT").run();
  } catch (e) {}

  // --- Tabel Transaksi (Versi Bersih Tanpa Customer/Status) ---
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount INTEGER DEFAULT 0,
      discount INTEGER DEFAULT 0,
      final_amount INTEGER DEFAULT 0,
      total_profit INTEGER DEFAULT 0,
      payment_method TEXT DEFAULT 'TUNAI',
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

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS stock_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      qty_added INTEGER,
      log_type TEXT, 
      log_date DATETIME DEFAULT CURRENT_TIMESTAMP
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
      "INSERT INTO products (barcode, name, cost_price, price, stock, category, item_number, brand, compatibility, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const info = stmt.run(
      p.barcode,
      p.name,
      p.cost_price,
      p.price,
      p.stock,
      p.category || "",
      p.item_number || "",
      p.brand || "",
      p.compatibility || "",
      p.image_url || ""
    );

    if (p.stock > 0) {
      db.prepare(
        "INSERT INTO stock_logs (product_name, qty_added, log_type, log_date) VALUES (?, ?, ?, ?)"
      ).run(p.name, p.stock, "Barang Baru", getLocalTime());
    }
    return { success: true, id: info.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function updateProduct(id: number, p: any) {
  try {
    const oldProd: any = db
      .prepare("SELECT stock, name FROM products WHERE id = ?")
      .get(id);

    const stmt = db.prepare(
      "UPDATE products SET barcode=?, name=?, cost_price=?, price=?, stock=?, category=?, item_number=?, brand=?, compatibility=?, image_url=? WHERE id=?"
    );
    const info = stmt.run(
      p.barcode,
      p.name,
      p.cost_price,
      p.price,
      p.stock,
      p.category || "",
      p.item_number || "",
      p.brand || "",
      p.compatibility || "",
      p.image_url || "",
      id
    );

    if (oldProd && p.stock > oldProd.stock) {
      const added = p.stock - oldProd.stock;
      db.prepare(
        "INSERT INTO stock_logs (product_name, qty_added, log_type, log_date) VALUES (?, ?, ?, ?)"
      ).run(p.name, added, "Tambah Stok", getLocalTime());
    }
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function deleteProduct(id: number) {
  try {
    const check = db
      .prepare(
        "SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?"
      )
      .get(id) as any;
    if (check.count > 0)
      return {
        success: false,
        reason: "LOCKED",
        msg: "Barang sedang digunakan dalam transaksi hari ini!",
      };
    const info = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return { success: info.changes > 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- KASIR & LAPORAN ---
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
    const finalAmount = totalAmount - discount;
    const totalProfit = finalAmount - totalCost;

    const info = db
      .prepare(
        "INSERT INTO transactions (total_amount, discount, final_amount, total_profit, payment_method, payment_date) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
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
      if (updateResult.changes === 0)
        throw new Error(`Stok kurang untuk barang: ${item.name}`);
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

export function getTodayReport() {
  try {
    const stmt = db.prepare(
      `SELECT COUNT(id) as total_transaction, COALESCE(SUM(total_amount), 0) as gross_sales, COALESCE(SUM(discount), 0) as total_discount, COALESCE(SUM(final_amount), 0) as net_sales, COALESCE(SUM(total_profit), 0) as total_profit FROM transactions WHERE date(payment_date) = date('now', 'localtime')`
    );
    return (
      stmt.get() || {
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
    return db
      .prepare(
        `SELECT t.id, t.payment_date, t.payment_method, t.total_amount as gross_total, t.discount, t.final_amount as net_total, t.total_profit as profit, GROUP_CONCAT(p.name || ' (x' || ti.qty || ')', ', ') as items_summary FROM transactions t JOIN transaction_items ti ON t.id = ti.transaction_id LEFT JOIN products p ON ti.product_id = p.id WHERE date(t.payment_date) = date('now', 'localtime') GROUP BY t.id ORDER BY t.payment_date DESC`
      )
      .all();
  } catch (e) {
    return [];
  }
}

export function getDailyHistory() {
  try {
    return db
      .prepare(
        `SELECT date(payment_date) as period_id, strftime('%d', payment_date) || ' ' || CASE strftime('%m', payment_date) WHEN '01' THEN 'Januari' WHEN '02' THEN 'Februari' WHEN '03' THEN 'Maret' WHEN '04' THEN 'April' WHEN '05' THEN 'Mei' WHEN '06' THEN 'Juni' WHEN '07' THEN 'Juli' WHEN '08' THEN 'Agustus' WHEN '09' THEN 'September' WHEN '10' THEN 'Oktober' WHEN '11' THEN 'November' WHEN '12' THEN 'Desember' END || ' ' || strftime('%Y', payment_date) as label, SUM(final_amount) as revenue, SUM(final_amount - total_profit) as expense, SUM(total_profit) as profit, SUM(CASE WHEN payment_method = 'TUNAI' THEN final_amount ELSE 0 END) as tunai, SUM(CASE WHEN payment_method = 'QRIS' THEN final_amount ELSE 0 END) as qris, SUM(CASE WHEN payment_method = 'DEBIT' THEN final_amount ELSE 0 END) as debit FROM transactions GROUP BY period_id ORDER BY period_id DESC LIMIT 30`
      )
      .all();
  } catch (e) {
    return [];
  }
}

export function getStockLogs() {
  try {
    return db
      .prepare(`SELECT * FROM stock_logs ORDER BY log_date DESC LIMIT 50`)
      .all();
  } catch (e) {
    return [];
  }
}

export function getMonthlyChart() {
  try {
    const stmt = db.prepare(
      `SELECT payment_date, total_amount as gross_total, total_profit as profit FROM transactions ORDER BY id DESC`
    );
    const rows = stmt.all();
    const grouped: Record<
      string,
      { revenue: number; profit: number; dateObj: Date }
    > = {};
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    rows.forEach((row: any) => {
      let date: Date | null = null;
      const rawDate = String(row.payment_date);
      if (rawDate.includes("/")) {
        try {
          const cleanDateStr = rawDate.split(" ")[0].replace(",", "").trim();
          const parts = cleanDateStr.split("/");
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year))
              date = new Date(year, month, day);
          }
        } catch (e) {}
      }
      if (!date || isNaN(date.getTime())) date = new Date(rawDate);

      if (date && !isNaN(date.getTime()) && date >= sixMonthsAgo) {
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!grouped[key])
          grouped[key] = { revenue: 0, profit: 0, dateObj: date };
        const revenue = Number(row.gross_total) || 0;
        const profit = Number(row.profit) || 0;
        grouped[key].revenue += revenue;
        grouped[key].profit += profit;
      }
    });

    const result = Object.keys(grouped)
      .sort()
      .map((key) => {
        const item = grouped[key];
        const monthName = item.dateObj.toLocaleString("id-ID", {
          month: "short",
        });
        const yearShort = item.dateObj.getFullYear().toString().slice(-2);
        return {
          label: `${monthName} '${yearShort}`,
          revenue: item.revenue,
          profit: item.profit,
        };
      });

    if (result.length === 0) {
      const monthName = now.toLocaleString("id-ID", { month: "short" });
      const yearShort = now.getFullYear().toString().slice(-2);
      return [{ label: `${monthName} '${yearShort}`, revenue: 0, profit: 0 }];
    }
    return result;
  } catch (error) {
    console.error("Error chart:", error);
    return [];
  }
}

export function getTopProductsByCategory() {
  try {
    const stmt = db.prepare(
      `SELECT p.category, p.name, p.brand, p.stock as current_stock, COALESCE(SUM(ti.qty), 0) as total_sold, COALESCE(SUM(ti.price_at_transaction * ti.qty), 0) as total_revenue FROM transaction_items ti JOIN products p ON ti.product_id = p.id WHERE p.category IS NOT NULL AND p.category != '' GROUP BY p.id ORDER BY p.category ASC, total_sold DESC`
    );
    return stmt.all();
  } catch (e) {
    return [];
  }
}
  