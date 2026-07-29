import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';

export async function removeCoverFile(
  coverImage: string | null,
): Promise<void> {
  if (!coverImage) {
    return;
  }

  const filename = basename(coverImage);

  if (!filename) {
    return;
  }

  const filePath = join(process.cwd(), 'uploads', 'covers', filename);

  try {
    await unlink(filePath);
  } catch {
    // Файл мог быть удалён вручную или отсутствовать.
  }
}
