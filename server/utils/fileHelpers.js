import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, "..", "uploads");

export const normalizeTags = (tags = []) =>
  Array.from(
    new Set(
      tags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
    )
  );

export const deleteLocalFile = async (imageUrl) => {
  if (!imageUrl) {
    return;
  }

  const filename = path.basename(imageUrl);
  const absolutePath = path.join(uploadsDirectory, filename);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Failed to remove image ${absolutePath}:`, error.message);
    }
  }
};

export const getUploadAbsolutePath = (imageUrl) => {
  const filename = path.basename(imageUrl || "");
  return path.join(uploadsDirectory, filename);
};
