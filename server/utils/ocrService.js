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

export const extractTextFromImage = async (filePath) => {
  const {
    data: { text }
  } = await Tesseract.recognize(filePath, "eng");

  return normalizeExtractedText(text || "");
};
