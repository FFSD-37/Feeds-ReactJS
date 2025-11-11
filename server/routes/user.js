import express from "express";
import {
  handleSignup,
  // handleLogin,
  sendotp,
  verifyotp,
  updatepass,
  handleContact,
  handledelacc,
  handlelogout,
  handlegetHome,
  handlegetpayment,
  handlegetprofile,
  handlegetterms,
  handlegetcontact,
  handlegetconnect,
  handlegetgames,
  handlegetdelacc,
  handlegetreels,
  handlegethelp,
  handlegetsignup,
  handlegetforgetpass,
  handlegetadmin,
  handleadminlogin,
  handlefpadmin,
  adminPassUpdate,
  handlegeteditprofile,
  handlegetpostoverlay,
  handlegetcreatepost,
  handlecreatepost,
  handlegetcreatepost2,
  updateUserProfile,
  fetchOverlayUser,
  followSomeone,
  unfollowSomeone,
  getSearch,
  handlegetnotification,
  handlegetsettings,
  togglePP,
  signupChannel,
  registerChannel,
  handlegetlog,
  createPostfinalize,
  uploadFinalPost,
  reportAccount,
  handlegetloginchannel,
  handleloginchannel,
  handlegetallnotifications,
  handleloginsecond,
  handlelikereel,
  handlereportpost,
  handlegetads,
  handlelikecomment,
  handleblockuser,
  handledeletepost,
  handlearchivepost,
  handleunarchivepost,
  handleunsavepost,
  handlepostcomment,
  handleGetEditChannel,
  updateChannelProfile,
} from "../controllers/user.js";
import {
  handlegetUserPost
} from "../controllers/Gourav/profile.js";
import { 
  handlegetchannel,
  getChannelPosts
} from "../controllers/Ayush/channel.js";
import{
  getAllChannelPosts
} from "../controllers/Ayush/home.js"
import { handleimagKitauth } from "../services/imagKit.js";
import { isAuthuser } from "../middleware/isAuthuser.js";
import { checkOut, verify_payment } from "../controllers/payment.js";
import { getChat, getChatpage } from "../controllers/chat.js";
import { getDailyusage } from "../controllers/timout.js";
import { handlegetstories } from "../controllers/userStory.js";

const router = express.Router();

router.get("/", isAuthuser, (req, res) => {
  res.redirect("/login");
});

router.get("/home", isAuthuser, handlegetHome);

router.get("/payment", isAuthuser, handlegetpayment);

// router.get("/profile/:username", isAuthuser, handlegetprofile);

router.get("/tandc", isAuthuser, handlegetterms);

router.get("/contact", isAuthuser, handlegetcontact);

router.get("/connect", isAuthuser, handlegetconnect);

router.get("/games", isAuthuser, handlegetgames);

router.get("/stories", isAuthuser, handlegetstories);

router.get("/delacc", isAuthuser, handlegetdelacc);

router.get("/reels", isAuthuser, handlegetreels);

router.get("/create_post", isAuthuser, handlegetcreatepost);

router.get("/create_post_2", isAuthuser, handlegetcreatepost2);

router.get("/help", isAuthuser, handlegethelp);

router.get("/notifications", isAuthuser, handlegetnotification);

router.get("/login", isAuthuser, (req, res) => {
  res.render("login", {
    loginType: null,
    msg: null,
  });
});

router.get("/verify", isAuthuser, (req, res) => {
  return res.json({
    username: req.userDetails.data[0],
    email: req.userDetails.data[1],
    profileUrl: req.userDetails.data[2],
    type: req.userDetails.data[3],
    isPremium: req.userDetails.data[4],
  });
});

router.get("/admin", handlegetadmin);

router.get("/signup", isAuthuser, handlegetsignup);

// router.post("/login", isAuthuser, handleLogin);

router.post("/signup", isAuthuser, handleSignup);

router.post("/contact", isAuthuser, handleContact);

router.post("/adminLogin", handleadminlogin);

router.post("/delacc", isAuthuser, handledelacc);

router.get("/forget-password", handlegetforgetpass);

router.post("/logout", isAuthuser, handlelogout);

router.post("/sendotp", sendotp);

router.post("/verifyotp", verifyotp);

router.post("/createpost", isAuthuser, handlecreatepost);

router.post("/updatepass", updatepass);

router.get("/imagKitauth", handleimagKitauth);

router.get("/fpadmin", handlefpadmin);

router.get("/edit_profile", isAuthuser, handlegeteditprofile);

router.post("/updatepassadmin", adminPassUpdate);

router.get("/post_overlay", isAuthuser, handlegetpostoverlay);

router.post("/checkout_razorpay", isAuthuser, checkOut);

router.post("/payment", isAuthuser, checkOut);

router.post("/verify_payment", isAuthuser, verify_payment);

router.post("/updateUserDetails", isAuthuser, updateUserProfile);

router.post("/fetchUserOverlay", fetchOverlayUser);

router.post("/follow/:username", isAuthuser, followSomeone);

router.post("/unfollow/:username", isAuthuser, unfollowSomeone);

router.get("/chat/:username", isAuthuser, getChat);

router.get("/chat", isAuthuser, getChatpage);

router.get("/search/:username", isAuthuser, getSearch);

router.get("/dailyUsage", isAuthuser, getDailyusage);

router.get("/settings", isAuthuser, handlegetsettings);

router.post("/togglePublicPrivate", isAuthuser, togglePP);

router.get("/create_channel", isAuthuser, signupChannel);

router.post("/signupChannel", isAuthuser, registerChannel);

router.post("/finalSubmit", isAuthuser, createPostfinalize);

router.get("/activityLog", isAuthuser, handlegetlog);

router.post("/shareFinalPost", isAuthuser, uploadFinalPost);

router.post("/report/:username", isAuthuser, reportAccount);

router.get("/login_channel", isAuthuser, handlegetloginchannel);

router.post("/postloginchannel", isAuthuser, handleloginchannel);

router.get("/GetAllNotifications", isAuthuser, handlegetallnotifications);

router.get("/profile:username", isAuthuser, handlegetUserPost);

router.post("/atin_job", handleloginsecond);

router.post("/posts/like", isAuthuser, handlelikereel);

router.post("/comment",isAuthuser, handlepostcomment);

router.post("/report_post", isAuthuser, handlereportpost);

router.get("/ads", isAuthuser, handlegetads);

router.post("/comment/like/:id", isAuthuser, handlelikecomment);

router.post("/block/:username", isAuthuser, handleblockuser);

router.post("/delete/:id", isAuthuser, handledeletepost);

router.post("/archive/:id", isAuthuser, handlearchivepost);

router.post("/unarchive/:id", isAuthuser, handleunarchivepost);

router.post("/unsave/:id", isAuthuser, handleunsavepost);

router.get("/getchannel/:channelName", isAuthuser, handlegetchannel);

router.get("/getchannelposts", getChannelPosts);

router.get("/edit_channel", isAuthuser, handleGetEditChannel);

router.post("/updateChannelDetails", isAuthuser, updateChannelProfile);

router.get("/getAllChannelPosts", isAuthuser, getAllChannelPosts);

export default router;