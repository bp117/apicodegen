import axios from "axios";

import * as Config from "./config";

interface Data {
  prompt: string;
}

export const getDownloads = async () => {
  try {
    const res = await axios.get(`${Config.BASE_URL}/project`);

    return res;
  } catch (e) {
    return {
      error: e,
    };
  }
};
