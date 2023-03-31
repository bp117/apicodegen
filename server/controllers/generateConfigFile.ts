import { NextFunction, Response } from "express";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateConfigFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prompt = req?.body?.prompt;

    if (!prompt) {
      throw {
        message: "Prompt message was not sent",
      };
    }

    const version = "1.0.0";
    const schemes = ["http", "https"];

    const finalPrompt = `Generate an OpenAPI specification for an app using this description "${prompt}"\nVersion: ${version} \nSchemes: ${schemes.join(
      ", "
    )}\n\n`;

    const completion = await openai.createCompletion(
      {
        model: "text-davinci-003",
        prompt: finalPrompt,
        max_tokens: 2048,
        temperature: 0,
        stream: true,
      },
      { responseType: "stream" }
    );

    res.write("---YAML---"); // Start YAML document

    completion.data.on("data", (data) => {
      const lines = data
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        if (message === "[DONE]") {
          res.end();
          return; // Stream finished
        }
        try {
          const parsed = JSON.parse(message);
          const parsedText = parsed.choices[0].text;
          res.write(`${parsedText}`);
        } catch (error) {
          console.error("Could not JSON parse stream message", message, error);
        }
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

export { generateConfigFile };
