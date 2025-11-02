import express from "express";
import { isAuthuser } from "../middleware/isAuthuser.js";
import{handlegetchannelobject} from "../controllers/Ayush/channel.js";

const router = express.Router();

// router.get("/",isAuthuser, (req, res) => {
//   res.redirect("/login");
// });


router.get("/getchannel/:channelid",isAuthuser, handlegetchannelobject);

export default router;