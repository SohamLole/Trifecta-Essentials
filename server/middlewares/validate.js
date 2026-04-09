import { validationResult } from "express-validator";

export const handleValidation = (req, _res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(" ");

  const validationError = new Error(message);
  validationError.statusCode = 400;
  return next(validationError);
};
