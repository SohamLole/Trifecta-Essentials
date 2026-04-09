import { Router } from "express";
import { body, param, query } from "express-validator";

import {
  deleteScreenshot,
  getScreenshotById,
  getScreenshotImage,
  getScreenshots,
  searchScreenshots,
  updateScreenshot,
  uploadScreenshot
} from "../controllers/screenshotController.js";
import { requireAuth } from "../middlewares/auth.js";
import { uploadSingleScreenshot } from "../middlewares/upload.js";
import { handleValidation } from "../middlewares/validate.js";

const router = Router();

router.use(requireAuth);

const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50."),
  query("tag")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Tag filter must be 30 characters or fewer."),
  query("sortBy")
    .optional()
    .isIn(["date", "difficulty"])
    .withMessage("Sort must be either date or difficulty."),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc."),
  handleValidation
];

router.post("/upload", uploadSingleScreenshot, uploadScreenshot);

router.get("/", paginationValidation, getScreenshots);

router.get(
  "/search",
  [
    query("q")
      .trim()
      .notEmpty()
      .withMessage("A search query is required.")
      .isLength({ max: 100 })
      .withMessage("Search query must be 100 characters or fewer."),
    ...paginationValidation
  ],
  searchScreenshots
);

router.get(
  "/:id/image",
  [
    param("id").isMongoId().withMessage("Invalid screenshot id."),
    handleValidation
  ],
  getScreenshotImage
);

router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid screenshot id."),
    handleValidation
  ],
  getScreenshotById
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid screenshot id."),
    body("tags")
      .isArray({ min: 0, max: 15 })
      .withMessage("Tags must be an array with up to 15 values."),
    body("tags.*")
      .isString()
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage("Each tag must be between 1 and 30 characters."),
    handleValidation
  ],
  updateScreenshot
);

router.delete(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid screenshot id."),
    handleValidation
  ],
  deleteScreenshot
);

export default router;
