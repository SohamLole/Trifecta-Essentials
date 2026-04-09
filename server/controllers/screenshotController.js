import mongoose from "mongoose";

import Screenshot from "../models/Screenshot.js";
import asyncHandler from "../utils/asyncHandler.js";
import { normalizeTags } from "../utils/fileHelpers.js";
import {
  deleteStoredImage,
  readStoredImage,
  saveImage
} from "../utils/imageStorage.js";
import { extractTextFromImage } from "../utils/ocrService.js";
import { escapeRegex, parsePagination } from "../utils/queryHelpers.js";
import analyzeIssue, { buildSortQuery } from "../utils/issueAnalyzer.js";
import generateTags from "../utils/tagGenerator.js";

export const uploadScreenshot = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("Please upload a PNG or JPG screenshot.");
    error.statusCode = 400;
    throw error;
  }

  let extractedText = "";
  let ocrWarning = null;

  try {
    extractedText = await extractTextFromImage(req.file.buffer, req.file.mimetype);
  } catch (error) {
    console.error("OCR processing failed:", error.message);
    ocrWarning = "OCR failed, so the screenshot was saved without extracted text.";
  }

  const tags = generateTags(extractedText);
  const issueAnalysis = analyzeIssue(extractedText, tags);
  let screenshot;
  let imageUrl = "";

  try {
    imageUrl = await saveImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname
    });

    screenshot = await Screenshot.create({
      owner: req.user._id,
      imageUrl,
      extractedText,
      tags,
      ...issueAnalysis
    });
  } catch (error) {
    if (imageUrl) {
      await deleteStoredImage(imageUrl);
    }

    throw error;
  }

  res.status(201).json({
    success: true,
    message: "Screenshot uploaded successfully.",
    data: screenshot,
    warning: ocrWarning
  });
});

export const getScreenshots = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePagination(req.query);
  const tag = req.query.tag?.trim().toLowerCase();
  const sort = buildSortQuery(req.query);

  const filter = {
    owner: req.user._id
  };

  if (tag) {
    filter.$or = [
      { tags: tag },
      { issueCategory: tag },
      { detailedTags: tag },
      { issueTags: tag },
      { "issues.detailedTag": tag },
      { "issues.tagLabel": tag }
    ];
  }

  const [items, total] = await Promise.all([
    Screenshot.find(filter).sort(sort).skip(skip).limit(limit),
    Screenshot.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  });
});

export const searchScreenshots = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePagination(req.query);
  const queryText = req.query.q.trim();
  const tag = req.query.tag?.trim().toLowerCase();
  const safeRegex = new RegExp(escapeRegex(queryText), "i");
  const sort = buildSortQuery(req.query);

  const filter = {
    owner: req.user._id,
    $and: [
      {
        $or: [
          { extractedText: safeRegex },
          { tags: safeRegex },
          { issueTags: safeRegex },
          { detailedTags: safeRegex },
          { issueSummary: safeRegex },
          { issueCategory: safeRegex },
          { suggestedFixes: safeRegex },
          { primaryLocation: safeRegex },
          { "issues.title": safeRegex },
          { "issues.detailedTag": safeRegex },
          { "issues.tagLabel": safeRegex },
          { "issues.location": safeRegex },
          { "issues.evidence": safeRegex }
        ]
      }
    ]
  };

  if (tag) {
    filter.$and.push({
      $or: [
        { tags: tag },
        { issueCategory: tag },
        { issueTags: tag },
        { detailedTags: tag },
        { "issues.detailedTag": tag },
        { "issues.tagLabel": tag }
      ]
    });
  }

  const [items, total] = await Promise.all([
    Screenshot.find(filter).sort(sort).skip(skip).limit(limit),
    Screenshot.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  });
});

export const getScreenshotById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error("Invalid screenshot id.");
    error.statusCode = 400;
    throw error;
  }

  const screenshot = await Screenshot.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!screenshot) {
    const error = new Error("Screenshot not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: screenshot
  });
});

export const updateScreenshot = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error("Invalid screenshot id.");
    error.statusCode = 400;
    throw error;
  }

  const tags = normalizeTags(req.body.tags);
  const existingScreenshot = await Screenshot.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!existingScreenshot) {
    const error = new Error("Screenshot not found.");
    error.statusCode = 404;
    throw error;
  }

  const issueAnalysis = analyzeIssue(existingScreenshot.extractedText, tags);

  const screenshot = await Screenshot.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { tags, ...issueAnalysis },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Tags updated successfully.",
    data: screenshot
  });
});

export const deleteScreenshot = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error("Invalid screenshot id.");
    error.statusCode = 400;
    throw error;
  }

  const screenshot = await Screenshot.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!screenshot) {
    const error = new Error("Screenshot not found.");
    error.statusCode = 404;
    throw error;
  }

  await deleteStoredImage(screenshot.imageUrl);

  res.status(200).json({
    success: true,
    message: "Screenshot deleted successfully."
  });
});

export const getScreenshotImage = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error("Invalid screenshot id.");
    error.statusCode = 400;
    throw error;
  }

  const screenshot = await Screenshot.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!screenshot) {
    const error = new Error("Screenshot not found.");
    error.statusCode = 404;
    throw error;
  }

  const image = await readStoredImage(screenshot.imageUrl);

  if (!image) {
    const error = new Error("Stored screenshot image not found.");
    error.statusCode = 404;
    throw error;
  }

  res.setHeader("Content-Type", image.contentType);
  res.status(200).send(image.buffer);
});
