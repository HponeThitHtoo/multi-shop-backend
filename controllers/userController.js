import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import { uploadUserPhoto, resizeUserPhoto } from "../utils/multer.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendMail from "../utils/sendMail.js";
import sendToken from "../utils/jwtToken.js";

const router = express.Router();

// create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "10m",
  });
};

router.post(
  "/create-uer",
  uploadUserPhoto,
  resizeUserPhoto,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, passwordConfirm, passwordChangedAt } =
        req.body;
      const userEmail = await User.findOne({ email });

      if (userEmail) {
        // delete the saved profile picture with the same email address
        const filename = req.file.filename;
        const filePath = `uploads/img/users/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });

        return next(new ErrorHandler("User already exists", 400));
      }

      const filename = req.file.filename;
      const fileUrl = path.join(filename);

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return next(new ErrorHandler("User already exists", 400));

      const user = await User.create({
        name: name,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
        passwordChangedAt: passwordChangedAt,
        avatar: fileUrl,
      });

      const activationToken = createActivationToken(user);

      const activationUrl = `http://localhost:3000/activation/${activationToken}`;

      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          activationUrl,
        });

        res.status(201).json({
          success: ture,
          message: `please check your email:- ${user.email} to activate your account! The token will expire in 10 minutes.`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;
      const verifiedUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!verifiedUser) return next(new ErrorHandler("Invalid token", 400));

      /* const {
        name,
        email,
        password,
        passwordConfirm,
        passwordChangedAt,
        avatar,
      } = verifiedUser; */

      let user = await User.findOne({ email: verifiedUser.email });

      if (!user)
        return next(
          new ErrorHandler("User not found with this email address!", 400)
        );

      user.active = true;
      await user.save();

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return next(new ErrorHandler("Please provide all fields!", 400));

      const user = await User.findOne({ email }).select("+password");
      if (!user) return next(new ErrorHandler("User doesn't exist!", 400));

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid)
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

export default router;
