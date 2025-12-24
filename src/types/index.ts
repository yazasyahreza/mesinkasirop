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

export interface Transaction {
  payment_date: string;
  product_name: string;
  price: number;
  qty: number;
  subtotal: number;
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
  total_omset: number;
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
      createTransaction: (items: any[], total: number) => Promise<any>;
      fetchTransactions: () => Promise<Transaction[]>;
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
