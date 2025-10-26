import express from "express";
import { isAuthuser } from "../middleware/isAuthuser.js";
import{} from "../controllers/Ayush.js";

const router = express.Router();
router.get("/",isAuthuser, (req, res) => {
  res.redirect("/login");
});

export default router;