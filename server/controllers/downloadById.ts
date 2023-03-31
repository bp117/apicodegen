import { NextFunction, Response } from "express";

import * as fs from "fs";

import path from "path";

import Directory from "../models/directories";

import { zip, COMPRESSION_LEVEL } from "zip-a-folder";

function getClientIp(req: Request) {
  return req.headers["x-forwarded-for"] || req?.connection?.remoteAddress;
}

const zipFolder = async (folderPath, zipPath, parentZipsFolder) => {
  if (!fs.existsSync(parentZipsFolder)) {
    fs.mkdirSync(parentZipsFolder, { recursive: true });
  }

  return await zip(folderPath, zipPath, {
    compression: COMPRESSION_LEVEL.uncompressed,
  });
};
export const downloadById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientIp = getClientIp(req);

    const fileId = req?.params?.fileId;

    const folderPath = path.resolve(
      process.cwd(),
      "downloads",
      clientIp,
      fileId
    );
    const zipPath = path.resolve(
      process.cwd(),
      "downloads",
      "zips",
      `${fileId}.zip`
    );
    const parentZipsFolder = path.join(process.cwd(), "downloads", "zips");

    if (!fs.existsSync(folderPath)) {
      return res.status(400).send({
        message: "File Does not exist",
      });
    }

    const zipRes = await zipFolder(folderPath, zipPath, parentZipsFolder);

    // Wait for the zip file to be created before sending it to the client
    res.download(zipPath, function (err) {
      if (err) {
        console.log("download err", err);
        res.status(400).send({
          message: "Error during download",
        });
      } else {
        // Delete the zip file once it has been sent to the client
        fs.unlinkSync(zipPath);
      }
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
