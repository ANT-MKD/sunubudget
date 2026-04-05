/** Taille max du fichier image avant lecture (évite de saturer le localStorage). */
export const MAX_AVATAR_FILE_BYTES = 900 * 1024;

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Veuillez choisir une image (JPEG, PNG, WebP…).');
  }
  if (file.size > MAX_AVATAR_FILE_BYTES) {
    throw new Error('Image trop volumineuse (maximum environ 850 Ko).');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Lecture impossible.'));
        return;
      }
      if (result.length > 1_400_000) {
        reject(new Error('Image trop lourde après encodage — essayez une photo plus petite.'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Lecture impossible.'));
    reader.readAsDataURL(file);
  });
}
