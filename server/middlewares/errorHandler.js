import multer from "multer";

export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0] || "field";

    return res.status(409).json({
      success: false,
      message: `${duplicateField} already exists.`
    });
  }

  const statusCode =
    error.statusCode ||
    error.status ||
    (error.name === "CastError" ? 400 : 500);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image is too large. Please upload a smaller file."
          : error.message
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      error.message || "Something went wrong while processing your request."
  });
};
