// src/utils/qris.ts
import crc16 from "crc/crc16ccitt"; // Anda perlu install: npm install crc

export function generateDynamicQRIS(rawQris: string, amount: number): string {
  // 1. Hapus CRC (4 karakter terakhir)
  let qris = rawQris.slice(0, -4);

  // 2. Siapkan Tag Nominal (Tag '54')
  // Format: "54" + "Panjang Karakter Nominal" + "Nominal"
  // Contoh Rp 15000 -> "540515000"
  const strAmount = amount.toString();
  const tag54 = "54" + strAmount.length.toString().padStart(2, "0") + strAmount;

  // 3. Cek apakah di QRIS mentah sudah ada tag 54 (biasanya belum ada di statis)
  // Jika belum, kita selipkan sebelum Tag '58' (Country Code) atau Tag '53' (Currency)
  // Cara gampang: Selipkan sebelum tag '58' (ID)

  if (qris.includes("540")) {
    // Jika sudah ada (jarang terjadi di statis), replace manual (kompleks, skip dulu)
    // Asumsi QRIS statis murni tanpa nominal
  } else {
    // Cari posisi Tag 58 (Country Code "ID")
    const index58 = qris.indexOf("5802ID");
    if (index58 !== -1) {
      qris = qris.slice(0, index58) + tag54 + qris.slice(index58);
    } else {
      // Fallback: taruh di akhir sebelum CRC
      qris += tag54;
    }
  }

  // 4. Tambahkan Tag '6304' (Penanda CRC)
  qris += "6304";

  // 5. Hitung CRC16 (CCITT-FALSE)
  const crc = crc16(qris).toString(16).toUpperCase().padStart(4, "0");

  // 6. Gabungkan
  return qris + crc;
}