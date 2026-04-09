import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  hashPassword,
  normalizeUsername,
  sanitizeUser,
  signAuthToken,
  verifyPassword
} from "../utils/authHelpers.js";
import { verifyGoogleCredential } from "../utils/googleAuth.js";

const buildAuthResponse = (user) => ({
  token: signAuthToken(user._id.toString()),
  user: sanitizeUser(user)
});

const createUniqueUsername = async (input) => {
  const baseUsername = normalizeUsername(input) || "snapsense_user";
  let candidate = baseUsername;
  let suffix = 0;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    const suffixText = String(suffix);
    const trimmedBase = baseUsername.slice(0, Math.max(3, 24 - suffixText.length));
    candidate = `${trimmedBase}${suffixText}`;
  }

  return candidate;
};

export const signupUser = asyncHandler(async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const email = req.body.email.trim().toLowerCase();

  if (username.length < 3) {
    const error = new Error("Username must include at least 3 valid characters.");
    error.statusCode = 400;
    throw error;
  }

  const [usernameExists, emailExists] = await Promise.all([
    User.exists({ username }),
    User.exists({ email })
  ]);

  if (usernameExists) {
    const error = new Error("That username is already taken.");
    error.statusCode = 409;
    throw error;
  }

  if (emailExists) {
    const error = new Error("That email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(req.body.password);

  const user = await User.create({
    username,
    email,
    passwordHash
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: buildAuthResponse(user)
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.passwordHash) {
    const error = new Error("This account uses Google sign-in. Please continue with Google.");
    error.statusCode = 400;
    throw error;
  }

  const passwordMatches = await verifyPassword(req.body.password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: buildAuthResponse(user)
  });
});

export const signInWithGoogle = asyncHandler(async (req, res) => {
  const payload = await verifyGoogleCredential(req.body.credential);
  const email = payload.email?.toLowerCase();

  if (!payload.sub || !email || !payload.email_verified) {
    const error = new Error("Google account verification failed.");
    error.statusCode = 401;
    throw error;
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email }]
  });

  if (!user) {
    const generatedUsername = await createUniqueUsername(payload.name || email.split("@")[0]);

    user = await User.create({
      username: generatedUsername,
      email,
      googleId: payload.sub,
      avatarUrl: payload.picture || ""
    });
  } else {
    user.googleId = payload.sub;
    user.avatarUrl = payload.picture || user.avatarUrl;
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Google sign-in successful.",
    data: buildAuthResponse(user)
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: sanitizeUser(req.user)
  });
});
