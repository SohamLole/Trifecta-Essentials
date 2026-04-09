import multer from "multer";
const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error("Only PNG and JPG images are allowed.");
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024
  }
});

export const uploadSingleScreenshot = upload.single("screenshot");
