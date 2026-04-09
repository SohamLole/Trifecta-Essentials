import Screenshot from "../models/Screenshot.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteLocalFile,
  getUploadAbsolutePath,
  normalizeTags
} from "../utils/fileHelpers.js";
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
    extractedText = await extractTextFromImage(req.file.path);
  } catch (error) {
    console.error("OCR processing failed:", error.message);
    ocrWarning = "OCR failed, so the screenshot was saved without extracted text.";
  }

  const tags = generateTags(extractedText);
  const issueAnalysis = analyzeIssue(extractedText, tags);
  let screenshot;

  try {
    screenshot = await Screenshot.create({
      owner: req.user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      extractedText,
      tags,
      ...issueAnalysis
    });
  } catch (error) {
    await deleteLocalFile(`/uploads/${req.file.filename}`);
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
    $and: [
      {
        owner: req.user._id
      },
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
    filter.$and[filter.$and.length - 1] = {
      $or: [
        { tags: tag },
        { issueCategory: tag },
        { issueTags: tag },
        { detailedTags: tag },
        { "issues.detailedTag": tag },
        { "issues.tagLabel": tag }
      ]
    };
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
  const screenshot = await Screenshot.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!screenshot) {
    const error = new Error("Screenshot not found.");
    error.statusCode = 404;
    throw error;
  }

  await deleteLocalFile(screenshot.imageUrl);

  res.status(200).json({
    success: true,
    message: "Screenshot deleted successfully."
  });
});

export const getScreenshotImage = asyncHandler(async (req, res) => {
  const screenshot = await Screenshot.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!screenshot) {
    const error = new Error("Screenshot not found.");
    error.statusCode = 404;
    throw error;
  }

  res.sendFile(getUploadAbsolutePath(screenshot.imageUrl));
});
