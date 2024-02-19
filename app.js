import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import ErrorHandler from "./middleware/error.js";

const app = new express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use("/", express.static(path.join(__dirname, "./uploads")));
app.use("/test", (req, res) => {
  res.send("Hello World!");
});

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({
    path: "config/.env",
  });
}

// import routes
import user from "./controllers/userController.js";

app.use("/api/v2/user", user);

// it's for ErrorHandling
app.use(ErrorHandler);

export default app;
