import * as express from "express";
const router = express.Router();

import {
  generateConfigFile,
  generateProject,
  getProjectsByIp,
} from "../controllers";
import { downloadById } from "../controllers/downloadById";

router.post("/generate-config", generateConfigFile);
router.post("/generate-project", generateProject);
router.get("/project", getProjectsByIp);
router.get("/downloads/:fileId", downloadById);

module.exports = router;
