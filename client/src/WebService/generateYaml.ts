import axios from "axios";

import * as Config from "./config";

interface Data {
  prompt: string;
}

export const generateYaml = async (data: Data) => {
  try {
    const res = await axios.post(`${Config.BASE_URL}/generate-config`, data, {
      responseType: "stream",
    });

    return res;
  } catch (e) {
    return {
      error: e,
    };
  }
};
