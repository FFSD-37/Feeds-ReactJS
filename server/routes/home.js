import express from "express";
import { getFriends } from "../controllers/Gourav/home.js";
import { isAuthuser } from "../middleware/isAuthuser.js";

const router = express.Router();

router.get("/getFriends", isAuthuser, getFriends);

export default router;