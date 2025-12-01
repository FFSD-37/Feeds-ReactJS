import express from "express";
import {
  handlechannelPostupload,
  handleGetcategories,
} from "../controllers/channelPost.js";
import { isAuthuser } from "../middleware/isAuthuser.js";

const router = express.Router();

router.post("/post", isAuthuser, handlechannelPostupload);
router.get("/categories", isAuthuser, handleGetcategories);

export default router;
