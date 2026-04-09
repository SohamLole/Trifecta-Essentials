import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.join(__dirname, "..", "uploads");
const imageStoreName = "screenshot-images";
let cachedGetStore = null;

const getExtension = (originalName = "", mimeType = "") => {
  const explicitExtension = path.extname(originalName).toLowerCase();

  if (explicitExtension) {
    return explicitExtension;
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  return ".jpg";
};

const isNetlifyRuntime = () => process.env.NETLIFY === "true" || Boolean(process.env.CONTEXT);

const getBlobStore = async () => {
  if (!cachedGetStore) {
    const { getStore } = await import("@netlify/blobs");
    cachedGetStore = getStore;
  }

  return cachedGetStore(imageStoreName);
};

const buildBlobKey = (originalName, mimeType) =>
  `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${getExtension(originalName, mimeType)}`;

const parseStoredImageRef = (imageRef = "") => {
  if (imageRef.startsWith("blob:")) {
    return {
      provider: "blob",
      key: imageRef.slice(5)
    };
  }

  if (imageRef.startsWith("local:")) {
    return {
      provider: "local",
      key: imageRef.slice(6)
    };
  }

  if (imageRef.startsWith("/uploads/")) {
    return {
      provider: "local",
      key: path.basename(imageRef)
    };
  }

  return {
    provider: "local",
    key: path.basename(imageRef)
  };
};

export const saveImage = async ({ buffer, mimeType, originalName }) => {
  if (!buffer?.length) {
    throw new Error("Image buffer is empty.");
  }

  if (isNetlifyRuntime()) {
    const key = buildBlobKey(originalName, mimeType);
    const store = await getBlobStore();

    await store.set(key, buffer, {
      metadata: {
        contentType: mimeType,
        originalName
      }
    });

    return `blob:${key}`;
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${getExtension(originalName, mimeType)}`;
  const absolutePath = path.join(uploadsDirectory, filename);

  await fs.mkdir(uploadsDirectory, { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return `local:${filename}`;
};

export const deleteStoredImage = async (imageRef) => {
  if (!imageRef) {
    return;
  }

  const parsed = parseStoredImageRef(imageRef);

  if (parsed.provider === "blob") {
    try {
      const store = await getBlobStore();
      await store.delete(parsed.key);
    } catch (error) {
      console.warn(`Failed to remove blob image ${parsed.key}:`, error.message);
    }

    return;
  }

  const absolutePath = path.join(uploadsDirectory, parsed.key);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Failed to remove image ${absolutePath}:`, error.message);
    }
  }
};

export const readStoredImage = async (imageRef) => {
  const parsed = parseStoredImageRef(imageRef);

  if (parsed.provider === "blob") {
    const store = await getBlobStore();
    const entry = await store.getWithMetadata(parsed.key, {
      type: "arrayBuffer"
    });

    if (!entry) {
      return null;
    }

    return {
      buffer: Buffer.from(entry.data),
      contentType: entry.metadata?.contentType || "application/octet-stream"
    };
  }

  const absolutePath = path.join(uploadsDirectory, parsed.key);
  const buffer = await fs.readFile(absolutePath);
  const extension = path.extname(parsed.key).toLowerCase();
  const contentType = extension === ".png" ? "image/png" : "image/jpeg";

  return {
    buffer,
    contentType
  };
};
