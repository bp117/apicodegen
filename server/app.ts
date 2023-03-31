require("dotenv").config();

import Logger from "./lib/logger";

// const express = require("express");
import express, { Express } from "express";

const app: Express = express();

try {
  require("./startup/db")();
  require("./startup/routes")(app);

  let PORT: number = 5000;
  if (process.env.PORT) {
    PORT = parseInt(process.env.PORT as string);
  }

  app.listen(PORT, "0.0.0.0", () => {
    Logger.info(`Ai-Codegen server listening on port ${PORT}`);
  });
} catch (err) {
  console.log("error", err);
  Logger.error(err);
}
