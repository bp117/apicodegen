import axios from "axios";

import * as Config from "./config";

export const downloadById = async (id: string) => {
  try {
    const res = await axios.get(`${Config.BASE_URL}/downloads/${id}`, {
      responseType: "blob",
    });

    return res;
  } catch (e) {
    return {
      error: e,
    };
  }
};
