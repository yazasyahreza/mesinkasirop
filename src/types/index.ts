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
  brand?: string;
  compatibility?: string;
  created_at?: string;
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
  // [DIHAPUS] license_plate
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

// Interface untuk Laporan Mingguan, Bulanan, & Harian (History)
export interface PeriodReport {
  period_id: string;
  label: string;
  start_date?: string;
  end_date?: string;
  revenue: number;
  expense: number;
  profit: number;
  tunai: number;
  qris: number;
  debit: number;
}

// Interface untuk Produk Terlaris
export interface TopProduct {
  category: string;
  name: string;
  brand: string;
  current_stock: number;
  total_sold: number;
  total_revenue: number;
}

// --- DEFINISI GLOBAL WINDOW.API (PENTING!) ---
declare global {
  interface Window {
    api: {
      // Produk
      fetchProducts: () => Promise<Product[]>;
      addProduct: (data: any) => Promise<any>;
      editProduct: (id: number, data: any) => Promise<any>;
      deleteProduct: (id: number) => Promise<any>;

      // Transaksi
      // [DIKEMBALIKAN KE 4 PARAMETER]
      createTransaction: (
        items: any[],
        total: number,
        discount: number,
        paymentMethod: string
        // Parameter licensePlate SUDAH DIHAPUS
      ) => Promise<any>;

      fetchTransactions: () => Promise<Transaction[]>;
      fetchTodayTransactions: () => Promise<Transaction[]>;
      fetchTransactionDetails: (id: number) => Promise<TransactionDetail[]>;
      deleteTransaction: (id: number) => Promise<any>;

      // [DIHAPUS] getHistoryByPlate

      // Konfirmasi Pembayaran
      confirmPayment: (details: any) => Promise<boolean>;

      // Laporan
      fetchTodayReport: () => Promise<DailyReport>;

      // Tambahan agar Laporan.tsx tidak error juga
      fetchStockLogs: () => Promise<any[]>;
      fetchMonthlyChart: () => Promise<any[]>;

      // Riwayat Harian (Grid Card)
      fetchDailyHistory: () => Promise<PeriodReport[]>;

      // Laporan Mingguan & Bulanan (Table)
      fetchWeeklyReport: () => Promise<PeriodReport[]>;
      fetchMonthlyReport: () => Promise<PeriodReport[]>;

      // Produk Terlaris
      fetchTopProducts: () => Promise<TopProduct[]>;

      // Sync ke Google Sheets
      syncToCloud: () => Promise<{ success: boolean; msg: string }>;

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
