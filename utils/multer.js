import multer from "multer";
import sharp from "sharp";

import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "./ErrorHandler.js";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new ErrorHandler("Not an image! Please upload only images.", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("file");

export const resizeUserPhoto = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) return next();

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = file.originalname.split(".")[0];
  req.file.filename = filename + "-" + uniqueSuffix + ".jpeg";

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/img/users/${req.file.filename}`);

  next();
});
