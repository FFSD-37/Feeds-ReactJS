import express from "express";
import { getFriends } from "../controllers/Gourav/home.js";
import { isAuthuser } from "../middleware/isAuthuser.js";
import { suggestedPost2 } from "../controllers/userPost.js"

const router = express.Router();

router.get("/getFriends", isAuthuser, getFriends);

router.get("/getAllPosts", isAuthuser, suggestedPost2);

export default router;