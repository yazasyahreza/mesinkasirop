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
}

export interface CartItem extends Product {
  qty: number | string;
}

// [BARU] Definisi Metode Pembayaran
export type PaymentMethod = "TUNAI" | "QRIS" | "DEBIT";

export interface Transaction {
  id: number;
  payment_date: string;
  payment_method: string;
  items_summary: string; // [BARU] Contoh: "Oli (x2), Busi (x1)"
  gross_total: number; // [BARU] Total Tagihan Kotor
  discount: number;
  net_total: number; // [BARU] Total Bayar Bersih
  profit: number; // Laba Bersih Akhir
}

export interface TransactionDetail {
  product_name: string;
  qty: number;
  price_at_transaction: number;
  cost_at_transaction: number;
}

export interface DailyReport {
  total_transaction: number;
  gross_sales: number; // [BARU] Omset Kotor (Sebelum Diskon)
  total_discount: number;
  net_sales: number; // [UBAH NAMA] Biar jelas (Omset Bersih)
  total_profit: number;
}

// --- DEFINISI GLOBAL WINDOW.API (PENTING!) ---
declare global {
  interface Window {
    api: {
      // Produk
      fetchProducts: () => Promise<Product[]>;
      createProduct: (data: any) => Promise<any>;
      updateProduct: (id: number, data: any) => Promise<any>;
      deleteProduct: (id: number) => Promise<any>;

      // Transaksi
      // [UPDATE] Menambahkan parameter discount & paymentMethod
      createTransaction: (
        items: any[],
        total: number,
        discount: number,
        paymentMethod: string
      ) => Promise<any>;

      fetchTransactions: () => Promise<Transaction[]>;
      // Tambahan agar kompatibel dengan halaman Laporan yang menggunakan fetchTodayTransactions
      fetchTodayTransactions: () => Promise<Transaction[]>;

      fetchTransactionDetails: (id: number) => Promise<TransactionDetail[]>;
      deleteTransaction: (id: number) => Promise<any>;

      // Laporan
      fetchTodayReport: () => Promise<DailyReport>;

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
