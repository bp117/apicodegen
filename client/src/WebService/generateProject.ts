import axios from "axios";

import * as Config from "./config";

interface Data {
  prompt: string;
  initialPrompt: string;
  // language: string;
  yaml: string;
}

export const generateProject = async (data: Data) => {
  try {
    const res = await axios.post(`${Config.BASE_URL}/generate-project`, data);

    return res;
  } catch (e) {
    return {
      error: e,
    };
  }
};
