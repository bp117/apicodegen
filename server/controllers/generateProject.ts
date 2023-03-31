import { NextFunction, Response } from "express";
import { spawn } from "child_process";

import * as fs from "fs";

import path from "path";

import shortid from "shortid";

import Directory from "../models/directories";

import mongoose from "mongoose";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const convertPathToUnixStyle = (path: string) => {
  let newPath = path?.replace(/\\/g, "/");

  return newPath;
};

function getClientIp(req: Request) {
  return req.headers["x-forwarded-for"] || req?.connection?.remoteAddress;
}

const allowedLangs = ["nodejs-express-server", "ruby-on-rails", "spring"];

export const generateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const language = "spring";
    const prompt = req?.body?.prompt;
    const initialPrompt = req?.body?.initialPrompt;
    const yaml = req?.body?.yaml;

    const userIpAddress = getClientIp(req);

    const finalPrompt = `Reply with a 'yes' if you think the following quoted text means
    the user wants a code generated, we already have the code specifications for the user but we need an affirmative message to commence code generation,
    Please give a response convincing the user to send a text for generating his/her code,
    Do not use the word 'yes' while convincing
    The text is as follows "${prompt}"
    `;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: finalPrompt,
      max_tokens: 2048,
      temperature: 0,
    });

    const answer = completion.data.choices[0].text;

    console.log("answer ", answer);

    if (!answer?.toLowerCase()?.includes("yes")) {
      return res.status(400).send({
        message: answer,
      });
    }

    /**
     * check if language is allowed
     */
    if (!allowedLangs.some((lang) => lang == language?.trim())) {
      return res.status(400).send({
        message: `Invalid language "${language}".`,
      });
    }

    if (!yaml) {
      return res.status(400).send({
        message: "Yaml spec not sent",
      });
    }

    // Define the OpenAPI specification as a string
    const yamlContent = yaml;

    // Generate a random name for the YAML file
    const generatedId = shortid.generate();
    const yamlFileName = `${generatedId}.yaml`;
    const yamlFilePath = path.join(
      process.cwd(),
      "downloads",
      userIpAddress,
      `${generatedId}.yaml`
    );

    const outputDir = path.join(
      process.cwd(),
      "downloads",
      userIpAddress,
      generatedId
    );

    const yamlFileDir = path.join(process.cwd(), "downloads", userIpAddress);

    // Create the directory if it does not exist
    if (!fs.existsSync(yamlFileDir)) {
      fs.mkdirSync(yamlFileDir, { recursive: true });
    }

    // Write the YAML content to the file
    fs.promises.writeFile(yamlFilePath, yamlContent).then(async () => {
      // Define the command to run the OpenAPI Generator CLI inside the Docker container
      const command = ` npx @openapitools/openapi-generator-cli generate \
      -i ${convertPathToUnixStyle(yamlFilePath)} \
       -g ${language}\
        -o ${convertPathToUnixStyle(outputDir)} --skip-validate-spec
        `;

      const session = await mongoose.startSession();

      var startedTransaction = false;
      var processFailed = false;

      let shell, args;

      if (process.platform === "win32") {
        shell = "cmd.exe";
        args = ["/c", command];
      } else {
        shell = "/bin/sh";
        args = ["-c", command];
      }

      const docker = spawn(shell, args);

      // Log the output of the command as it runs
      docker.stdout.on("data", (data) => {
        // res.write(data.toString());

        if (!startedTransaction) {
          startedTransaction = true;
        }
      });

      // Check the stderr output for any errors
      docker.stderr.on("data", (data) => {
        console.error("error ", data.toString());

        processFailed = true;
        //abort session on any error
        // session.abortTransaction();
      });

      // Log a message when the command has completed
      docker.on("close", async (code) => {
        console.log(`Command completed with code ${code}`);
        if (!processFailed) {
          const directory = new Directory({
            userIpAddress,
            outputDirectory: outputDir,
            prompt: initialPrompt,
            language: language,
          });
          await directory.save();
          // session.commitTransaction();
        }
        res.end();
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

export { generateProject };
