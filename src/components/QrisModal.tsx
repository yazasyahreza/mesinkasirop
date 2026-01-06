import { QRCodeSVG } from "qrcode.react";
import { generateDynamicQRIS } from "../utils/qris";

// GANTI STRING INI DENGAN HASIL SCAN QRIS ASLI ANDA (Langkah 1)
const MY_STATIC_QRIS = "00020101021126580016ID.CO.GOPAY.WWW0118936009143...";

export default function QrisModal({
  amount,
  onClose,
}: {
  amount: number;
  onClose: () => void;
}) {
  // Generate QR Dinamis
  const dynamicString = generateDynamicQRIS(MY_STATIC_QRIS, amount);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          textAlign: "center",
          width: "300px",
        }}
      >
        <h3 style={{ color: "#1e293b", marginTop: 0 }}>Scan untuk Bayar</h3>

        {/* Nominal Besar */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#0f172a",
            marginBottom: "20px",
          }}
        >
          Rp {amount.toLocaleString("id-ID")}
        </div>

        {/* QR Code yang digenerate */}
        <div
          style={{
            background: "white",
            padding: "10px",
            borderRadius: "10px",
            border: "2px solid #e2e8f0",
            display: "inline-block",
          }}
        >
          <QRCodeSVG value={dynamicString} size={200} />
        </div>

        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "15px" }}>
          Nominal akan muncul otomatis.
          <br />
          Cek nama toko: <strong>OGENG PRESS</strong>
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "12px",
            width: "100%",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Selesai / Tutup
        </button>
      </div>
    </div>
  );
}
