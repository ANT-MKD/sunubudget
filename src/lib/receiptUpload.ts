import { supabase } from './supabase';

const MAX_RECEIPT_BYTES = 500 * 1024;

async function compressImage(file: File): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const maxWidth = 1400;
  const ratio = Math.min(1, maxWidth / imageBitmap.width);
  canvas.width = Math.max(1, Math.round(imageBitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(imageBitmap.height * ratio));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non disponible.');
  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  // Compression progressive jusqu'à <= 500Ko
  let quality = 0.82;
  for (let i = 0; i < 7; i += 1) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('Compression impossible.');
    if (blob.size <= MAX_RECEIPT_BYTES || quality <= 0.45) return blob;
    quality -= 0.08;
  }
  throw new Error('Compression impossible.');
}

export async function uploadReceipt(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le reçu doit être une image.');
  }
  const compressed = await compressImage(file);
  if (compressed.size > MAX_RECEIPT_BYTES) {
    throw new Error('Le reçu dépasse 500 Ko après compression.');
  }

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from('receipts').upload(path, compressed, {
    cacheControl: '3600',
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  return path;
}

export async function createReceiptSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
