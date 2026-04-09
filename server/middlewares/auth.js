import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAuthToken } from "../utils/authHelpers.js";

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);

  if (!token) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch (_error) {
    const error = new Error("Invalid or expired authentication token.");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    const error = new Error("Authenticated user no longer exists.");
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});
