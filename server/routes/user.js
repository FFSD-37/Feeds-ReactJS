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
  handleadminlogin,
  handlefpadmin,
  adminPassUpdate,
  handlegeteditprofile,
  handlegetcreatepost,
  handlecreatepost,
  handlegetcreatepost2,
  updateUserProfile,
  fetchOverlayUser,
  followSomeone,
  unfollowSomeone,
  unRequestSomeone,
  handlegetnotification,
  handlegetsettings,
  togglePP,
  signupChannel,
  registerChannel,
  handlegetlog,
  createPostfinalize,
  uploadFinalPost,
  reportAccount,
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
  handlegetUserPost,
  handlegetBasicDetails,
  handlegetsensitive,
  handleisfriend,
  handleCheckParentalPass,
  getCoins,
  handlechangepassKids,
  handlechangeparentalpass,
  handlegetkidsTime,
  handlesetkidsTime,
  handledeactivateKid,
  handlegetBlcokedUsers
} from "../controllers/Gourav/profile.js";
import {
  handlegetchannel,
  getChannelPosts,
  followChannel,
  unfollowChannel,
  archivePost,
  unarchivePost,
  deletePost,
} from "../controllers/Ayush/channel.js";
import {
  getAllChannelPosts,
  likeChannelPost,
  saveChannelPost,
  commentOnChannelPost,
  getSingleChannelPost,
  getKidsHomePosts,
  getChannelCommentReplies,
} from "../controllers/Ayush/home.js";
import {
  handleGetConnect,
  getSearch,
  followEntity,
  unfollowEntity,
} from "../controllers/Ayush/connect.js";
import {
  getReelsFeed,
  likeReel,
  unlikeReel,
  saveReel,
  unsaveReel,
  commentReel,
  replyReel,
  getReelComments,
} from "../controllers/Ayush/reels.js";
import { handleimagKitauth } from "../services/imagKit.js";
import { isAuthuser } from "../middleware/isAuthuser.js";
import { checkOut, verify_payment } from "../controllers/payment.js";
import { getChat, getFriendList } from "../controllers/chat.js";
import { getDailyusage } from "../controllers/timout.js";
import { handlegetstories } from "../controllers/userStory.js";
import homeRouter from "./home.js";

const router = express.Router();

router.get("/", isAuthuser, (req, res) => {
  res.redirect("/login");
});

router.get("/home", isAuthuser, handlegetHome);

router.get("/payment", isAuthuser, handlegetpayment);

// router.get("/profile/:username", isAuthuser, handlegetprofile);

router.get("/connect", isAuthuser, handleGetConnect);

router.get("/stories", isAuthuser, handlegetstories);

router.get("/create_post", isAuthuser, handlegetcreatepost);

router.get("/create_post_2", isAuthuser, handlegetcreatepost2);

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

// router.post("/login", isAuthuser, handleLogin);

router.post("/signup", handleSignup);

router.post("/contact", isAuthuser, handleContact);

router.post("/adminLogin", handleadminlogin);

router.post("/delacc", isAuthuser, handledelacc);

router.post("/logout", isAuthuser, handlelogout);

router.post("/sendotp", sendotp);

router.post("/verifyotp", verifyotp);

router.post("/createpost", isAuthuser, handlecreatepost);

router.post("/updatepass", updatepass);

router.get("/imagKitauth", handleimagKitauth);

router.get("/fpadmin", handlefpadmin);

router.get("/edit_profile", isAuthuser, handlegeteditprofile);

router.post("/updatepassadmin", adminPassUpdate);

router.post("/checkout_razorpay", isAuthuser, checkOut);

router.post("/payment", isAuthuser, checkOut);

router.post("/verify_payment", isAuthuser, verify_payment);

router.post("/updateUserDetails", isAuthuser, updateUserProfile);

router.post("/fetchUserOverlay", fetchOverlayUser);

router.post("/follow/:username", isAuthuser, followSomeone);

router.post("/unfollow/:username", isAuthuser, unfollowSomeone);

router.post("/unrequest/:username", isAuthuser, unRequestSomeone);

router.get("/chat/:username", isAuthuser, getChat);

router.get("/friends", isAuthuser, getFriendList);

router.get("/connect/search", isAuthuser, getSearch);

router.get("/dailyUsage", isAuthuser, getDailyusage);

router.get("/settings", isAuthuser, handlegetsettings);

router.get("/togglePublicPrivate", isAuthuser, togglePP);

router.get("/create_channel", isAuthuser, signupChannel);

router.post("/signupChannel", isAuthuser, registerChannel);

router.post("/finalSubmit", isAuthuser, createPostfinalize);

router.get("/activityLog", isAuthuser, handlegetlog);

router.post("/shareFinalPost", isAuthuser, uploadFinalPost);

router.post("/report/:username", isAuthuser, reportAccount);

router.post("/postloginchannel", isAuthuser, handleloginchannel);

router.get("/GetAllNotifications", isAuthuser, handlegetallnotifications);

router.get("/profile/:username", isAuthuser, handlegetUserPost);

router.post("/atin_job", handleloginsecond);

router.post("/posts/like", isAuthuser, handlelikereel);

router.post("/comment", isAuthuser, handlepostcomment);

router.post("/report_post", isAuthuser, handlereportpost);

router.get("/ads", isAuthuser, handlegetads);

router.post("/comment/like/:id", isAuthuser, handlelikecomment);

router.post("/block/:username", isAuthuser, handleblockuser);

router.get("/block", isAuthuser, handlegetBlcokedUsers);

router.post("/delete/:id", isAuthuser, handledeletepost);

router.post("/archive/:id", isAuthuser, handlearchivepost);

router.post("/unarchive/:id", isAuthuser, handleunarchivepost);

router.post("/unsave/:id", isAuthuser, handleunsavepost);

router.get("/getchannel/:channelName", isAuthuser, handlegetchannel);

router.get("/getchannelposts", isAuthuser, getChannelPosts);

router.get("/edit_channel", isAuthuser, handleGetEditChannel);

router.post("/updateChannelDetails", isAuthuser, updateChannelProfile);

router.get("/getAllChannelPosts", isAuthuser, getAllChannelPosts);

router.get("/channelPost/:id", isAuthuser, getSingleChannelPost);

router.post("/channel/like", isAuthuser, likeChannelPost);

router.post("/channel/save", isAuthuser, saveChannelPost);

router.post("/channel/comment", isAuthuser, commentOnChannelPost);

router.get("/channel/comment/replies/:commentId", getChannelCommentReplies);

router.post("/follow_channel/:channelName", isAuthuser, followChannel);

router.post("/unfollow_channel/:channelName", isAuthuser, unfollowChannel);

router.post("/channel/archive/:postId", isAuthuser, archivePost);

router.post("/channel/unarchive/:postId", isAuthuser, unarchivePost);

router.delete("/channel/delete/:postId", isAuthuser, deletePost);

router.post("/connect/follow", isAuthuser, followEntity);

router.post("/connect/unfollow", isAuthuser, unfollowEntity);

router.use("/home", homeRouter);

router.get("/profile/getbasic/:username", isAuthuser, handlegetBasicDetails);

router.get("/profile/sensitive/:username", isAuthuser, handlegetsensitive);

router.get("/isfriend/:username", isAuthuser, handleisfriend);

router.post("/checkParentPassword", isAuthuser, handleCheckParentalPass);

router.get("/kidshome", isAuthuser, getKidsHomePosts);

router.get("/getCoins", isAuthuser, getCoins);

router.post("/kids/change-password", isAuthuser, handlechangepassKids);

router.post("/kids/change-parental-password", isAuthuser, handlechangeparentalpass);

router.get("/kids/time-control", isAuthuser, handlegetkidsTime);

router.post("/kids/time-control", isAuthuser, handlesetkidsTime);

router.post("/kids/deactivate", isAuthuser, handledeactivateKid);

router.get("/reels", isAuthuser, getReelsFeed);

router.post("/likereel", isAuthuser, likeReel);

router.post("/unlikereel", isAuthuser, unlikeReel);

router.post("/savereel", isAuthuser, saveReel);

router.post("/unsavereel", isAuthuser, unsaveReel);

router.post("/commentreel", isAuthuser, commentReel);

router.post("/replyreel", isAuthuser, replyReel);

router.get("/reelcomments/:id", isAuthuser, getReelComments);

export default router;