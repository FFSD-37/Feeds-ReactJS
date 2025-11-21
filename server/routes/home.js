import express from "express";
import { getFriends, handlegetads, handlegetComments, handlepostreply, handlecommentreport } from "../controllers/Gourav/home.js";
import { isAuthuser } from "../middleware/isAuthuser.js";
import { suggestedPost2 } from "../controllers/userPost.js"

const router = express.Router();

router.get("/getFriends", isAuthuser, getFriends);

router.get("/getAllPosts", isAuthuser, suggestedPost2);

router.get("/ads", isAuthuser, handlegetads);

router.post("/userpost_comments", isAuthuser, handlegetComments);

router.post("/userpost_reply",isAuthuser, handlepostreply);

router.post("/comment_report", isAuthuser, handlecommentreport);

export default router;