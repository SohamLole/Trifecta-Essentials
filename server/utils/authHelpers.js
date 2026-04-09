import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);

export const signAuthToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

export const verifyAuthToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.verify(token, secret);
};

export const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl,
  hasPassword: Boolean(user.passwordHash),
  hasGoogleAuth: Boolean(user.googleId),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const normalizeUsername = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
