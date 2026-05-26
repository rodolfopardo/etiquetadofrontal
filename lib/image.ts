/**
 * Compresión de imagen en el cliente antes de enviarla al servidor.
 *
 * Objetivos:
 *   - Reducir tokens de input al modelo de visión (~70% menos costo)
 *   - Velocidad de upload desde 3G/4G
 *   - Calidad suficiente para que el OCR lea la tabla nutricional
 */

const MAX_DIMENSION = 1280;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto del canvas.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob falló"))),
      "image/jpeg",
      QUALITY,
    );
  });

  return await blobToDataUrl(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
