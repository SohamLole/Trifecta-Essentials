import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

import Tesseract from "tesseract.js";

const normalizeExtractedText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();

const getTempFilePath = (mimeType = "image/png") =>
  path.join(os.tmpdir(), `${randomUUID()}${mimeType === "image/png" ? ".png" : ".jpg"}`);

export const extractTextFromImage = async (fileInput, mimeType) => {
  let tempFilePath = "";

  if (Buffer.isBuffer(fileInput)) {
    tempFilePath = getTempFilePath(mimeType);
    await fs.writeFile(tempFilePath, fileInput);
  }

  const {
    data: { text }
  } = await Tesseract.recognize(tempFilePath || fileInput, "eng");

  if (tempFilePath) {
    await fs.unlink(tempFilePath).catch(() => {});
  }

  return normalizeExtractedText(text || "");
};
