import * as express from "express";
const cors = require("cors");

const allRoutes = require("../routes");

const morganMiddleware = require("../middleware/morgan");

module.exports = function (app: express.Express) {
  // Use Cors
  const corsOpts = {
    origin: "*",

    methods: ["GET", "POST", "PUT", "DELETE", "OPTION"],

    allowedHeaders: ["Content-Type", "x-id-token"],
  };
  app.use(morganMiddleware);
  app.use(cors(corsOpts));

  app.use(express.json());

  app.use("/", allRoutes);
};
