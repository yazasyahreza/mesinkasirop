// --- TIPE DATA OBJECT ---
export interface Product {
  id: number;
  barcode: string;
  name: string;
  cost_price: number; // Modal
  price: number; // Jual
  stock: number;
  category?: string;
  item_number?: string;
  created_at?: string; // [BARU] Tambahan untuk kolom Tanggal di Gudang
}

export interface CartItem extends Product {
  qty: number | string;
}

// Definisi Metode Pembayaran
export type PaymentMethod = "TUNAI" | "QRIS" | "DEBIT";

export interface Transaction {
  id: number;
  payment_date: string;
  payment_method: string;
  items_summary: string;
  gross_total: number;
  discount: number;
  net_total: number;
  profit: number;
}

export interface TransactionDetail {
  product_name: string;
  qty: number;
  price_at_transaction: number;
  cost_at_transaction: number;
}

export interface DailyReport {
  total_transaction: number;
  gross_sales: number;
  total_discount: number;
  net_sales: number;
  total_profit: number;
}

// [BARU] Interface untuk Laporan Mingguan & Bulanan
export interface PeriodReport {
  period_id: string;
  label: string; // Contoh: "Januari 2025" atau "2025-12-20 s/d ..."
  start_date?: string; // Khusus Mingguan
  end_date?: string; // Khusus Mingguan
  revenue: number;
  expense: number;
  profit: number;
  tunai: number; // [BARU] Rincian Tunai
  qris: number; // [BARU] Rincian QRIS
  debit: number; // [BARU] Rincian Debit
}

// --- DEFINISI GLOBAL WINDOW.API (PENTING!) ---
declare global {
  interface Window {
    api: {
      // Produk
      fetchProducts: () => Promise<Product[]>;

      // [UPDATE NAMA] Diubah jadi addProduct agar sesuai dengan Gudang.tsx
      addProduct: (data: any) => Promise<any>;

      // [UPDATE NAMA] Diubah jadi editProduct agar sesuai dengan Gudang.tsx
      editProduct: (id: number, data: any) => Promise<any>;

      deleteProduct: (id: number) => Promise<any>;

      // Transaksi
      createTransaction: (
        items: any[],
        total: number,
        discount: number,
        paymentMethod: string
      ) => Promise<any>;

      fetchTransactions: () => Promise<Transaction[]>;
      fetchTodayTransactions: () => Promise<Transaction[]>;
      fetchTransactionDetails: (id: number) => Promise<TransactionDetail[]>;
      deleteTransaction: (id: number) => Promise<any>;

      // Konfirmasi Pembayaran (Opsional, jika pakai dialog konfirmasi)
      confirmPayment: (details: any) => Promise<boolean>;

      // Laporan
      fetchTodayReport: () => Promise<DailyReport>;

      // [BARU] Tambahan untuk Laporan Mingguan & Bulanan
      fetchWeeklyReport: () => Promise<PeriodReport[]>;
      fetchMonthlyReport: () => Promise<PeriodReport[]>;

      // Backup Database
      backupDatabase: () => Promise<{
        success: boolean;
        path?: string;
        msg?: string;
      }>;

      restoreDatabase: () => Promise<{ success: boolean; msg?: string }>;
    };
  }
}
