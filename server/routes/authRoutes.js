import { Router } from "express";
import { body } from "express-validator";

import {
  getCurrentUser,
  loginUser,
  signupUser,
  signInWithGoogle
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { handleValidation } from "../middlewares/validate.js";

const router = Router();

router.post(
  "/signup",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 24 })
      .withMessage("Username must be between 3 and 24 characters.")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores."),
    body("email").trim().isEmail().withMessage("Please provide a valid email address."),
    body("password")
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters."),
    handleValidation
  ],
  signupUser
);

router.post(
  "/login",
  [
    body("identifier")
      .trim()
      .notEmpty()
      .withMessage("Username or email is required.")
      .isLength({ max: 100 })
      .withMessage("Username or email is too long."),
    body("password")
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters."),
    handleValidation
  ],
  loginUser
);

router.post(
  "/google",
  [
    body("credential").trim().notEmpty().withMessage("Google credential is required."),
    handleValidation
  ],
  signInWithGoogle
);

router.get("/me", requireAuth, getCurrentUser);

export default router;
