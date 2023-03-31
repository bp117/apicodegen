import mongoose from "mongoose";

export interface IDirectory extends Document {
  userIpAddress: string;
  outputDirectory: string;
  prompt: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const directorySchema = new mongoose.Schema(
  {
    userIpAddress: {
      type: String,
      required: true,
    },
    outputDirectory: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
    },
    language: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Directory = mongoose.model("directory", directorySchema);

export default Directory;
