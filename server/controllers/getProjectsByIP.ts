import { NextFunction, Response } from "express";

import * as fs from "fs";

import path from "path";

import Directory from "../models/directories";

function getClientIp(req: Request) {
  return req.headers["x-forwarded-for"] || req?.connection?.remoteAddress;
}

export const getProjectsByIp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientIp = getClientIp(req);

    const ipDownloadsDir = path.join(process.cwd(), "downloads", clientIp);

    if (!fs.existsSync(ipDownloadsDir)) {
      return res.status(400).send({
        message: "No Previously generated projects",
      });
    }

    let filenames = await fs.promises.readdir(ipDownloadsDir, {
      withFileTypes: true,
    });

    const folders = filenames
      .filter((filenames) => filenames.isDirectory())
      .map((filenames) => filenames.name);

    if (folders.length == 0) {
      return res.status(400).send({
        message: "No Previously generated projects",
      });
    }

    const promises = folders.map(async (folder) => {
      const directory = await Directory.findOne({
        outputDirectory: { $regex: folder, $options: "i" },
      });

      return {
        folderName: folder,
        directory,
      };
    });

    Promise.all(promises).then((mappedFolders) => {
      res.send({
        folders: mappedFolders,
      });
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
      detail: error,
    });

    next(error);
  }
};

export { getProjectsByIp };
