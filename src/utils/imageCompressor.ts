// src/utils/imageCompressor.ts

export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");

        // ATURAN UKURAN: Maksimal Lebar 800px (Sangat cukup untuk tabel/zoom)
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;

        // Jika gambar asli lebih kecil dari 800px, jangan diperbesar
        const finalWidth = scaleSize < 1 ? MAX_WIDTH : img.width;
        const finalHeight = scaleSize < 1 ? img.height * scaleSize : img.height;

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, finalWidth, finalHeight);

        const compressedBase64 = canvas.toDataURL("image/webp", 0.7);

        resolve(compressedBase64);
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
};
