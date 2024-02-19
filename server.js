import dotenv from "dotenv";

import app from "./app.js";
import connectDatabase from "./db/Database.js";

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server for handling uncaught exception`);
});

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({
    path: "config/.env",
  });
}

// connect db
connectDatabase();

// create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`Shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
