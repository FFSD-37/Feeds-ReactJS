import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { create_JWTtoken } from 'cookie-string-parser';
import User from '../models/users_schema.js';
import Post from '../models/postSchema.js';
import Report from "../models/reports.js";
import Payment from "../models/payment.js";
import ActivityLog from "../models/activityLogSchema.js"
import ResetPassword from "../models/reset_pass_schema.js";
import bcrypt, { compare } from 'bcrypt';
import Feedback from '../models/feedbackForm.js';
import DelUser from '../models/SoftDelUsers.js';
import Notification from '../models/notification_schema.js';
import Channel from "../models/channelSchema.js"
import channelPost from '../models/channelPost.js';
import Story from "../models/storiesSchema.js";

async function storeOtp(email, otp) {
  try {
    const existing = await ResetPassword.findOne({ email });

    if (existing) {
      existing.otp = otp;
      await existing.save();
      console.log(`✅ OTP for ${email} updated successfully.`);
    } else {
      await ResetPassword.create({ email, otp });
      console.log(`✅ OTP for ${email} saved successfully.`);
    }
  } catch (err) {
    console.error(`❌ Error storing OTP for ${email}:`, err);
  }
}

async function getOtp(email) {
  try {
    const record = await ResetPassword.findOne({ email });
    return record ? record.otp : null;
  } catch (err) {
    console.error(`❌ Error retrieving OTP for ${email}:`, err);
    return null;
  }
}

const handleSignup = async (req, res) => {
  console.log(req.body)
  try {
    const pass = await bcrypt.hash(req.body.password, 10);
    const userData = {
      fullName: req.body.fullName,
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: pass,
      dob: req.body.dob,
      profilePicture: req.body.profileImageUrl ? req.body.profileImageUrl : process.env.DEFAULT_USER_IMG,
      bio: req.body.bio || "",
      gender: req.body.gender,
      type: req.body.acctype,
      isPremium: false,
      termsAccepted: !req.body.terms
    };

    await User.create(userData);
    await ActivityLog.create({ username: req.body.username, id: `#${Date.now()}`, message: "You Registered Successfully!!" });
    await User.findOneAndUpdate(
      { username: req.body.username },
      {
        $inc: {
          coins: 10
        }
      }
    )
    return res.render("login", { loginType: "Email", msg: "User Registered Successfully" });
  }
  catch (err) {
    if (err.cause.code === 11000) {
      const fields = Object.keys(err.cause.keyValue);
      return res.render("Registration", { msg: `User with ${fields[0]} already exists` });
    }
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.render("Registration", { msg: errors });
    };
  }
}

const handledelacc = async (req, res) => {
  try {
    console.log(req.body);
    const { data } = req.userDetails;
    const user = await User.findOne({ username: data[0] }).lean();

    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.render("delacc", {
        img: data[2],
        currUser: data[0],
        msg: "Incorrect Password"
      });
    }
    const liked = user.likeIds || [];
    for (const postId of liked) {
      const post = await Post.findById(postId);
      if (post) {
        post.likes -= 1;
      }
    }
    await DelUser.insertOne(user);

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'DELETION ON ACCOUNT',
      text: `Your Account ${user.username} from FEEDS has been deleted on Date: ${new Date()}. If it's not you, please Restore your account using /restore url from the login page. It's been great having you.`
    };

    await ActivityLog.create({ username: user.username, id: `#${Date.now()}`, message: "Your Account has been delete" })
    await User.findByIdAndDelete({ _id: user._id });
    try {
      await transporter.sendMail(mailOptions);
      res.render("login", { loginType: "Email", msg: "Account deleted successfully." });
    }
    catch (err) {
      console.error('Error sending email:', err);
      return res.status(500).json({ msg: "Failed to send OTP" });
    }

  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send("Internal Server Error");
  }
};

const handleLogin = async (req, res) => {
  try {
    const user = await User.findOne(req.body.identifykro === 'username' ? { username: req.body.identifier } : { email: req.body.identifier });
    if (!user) return res.render("login", { loginType: "Email", msg: "Username Doesn't exists" });
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) return res.render("login", { loginType: "Username", msg: "Incorrect password" });

    const token = create_JWTtoken([user.username, user.email, user.profilePicture, user.type], process.env.USER_SECRET, '30d');
    res.cookie('uuid', token, { httpOnly: true });
    return res.redirect("/home");
  }
  catch (e) {
    console.log(e);
    return res.render("login", { loginType: "Email", msg: "Something went wrong" });
  }
};

function generateOTP() {
  const characters = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return otp;
}

const sendotp = async (req, res) => {
  var mail = req.body.email;
  if (!(await User.findOne({ email: mail }))) {
    return res.render("Forgot_pass", { msg: "No such user", newpass: "NO", otpsec: "NO", emailsec: "YES", title: "Forgot Password" });
  }
  var otp = generateOTP();
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: mail,
    subject: 'Your OTP Code',
    text: `Your OTP for resetting the password is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    storeOtp(mail, otp);
    return res.render("Forgot_pass", { msg: "OTP Sent successfully!!", otpsec: "YES", newpass: "NO", emailsec: "NO", title: "Forgot Password" });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ msg: "Failed to send OTP" });
  }
}

const verifyotp = async (req, res) => {
  const action = req.body.action;
  if (action === "verify") {
    getOtp(req.body.foremail)
      .then((otp) => {
        if (otp) {
          if (otp === req.body.otp) {
            return res.render("Forgot_pass", { msg: "OTP Verified", otpsec: "NO", newpass: "YES", emailsec: "NO", title: "Forgot Password" })
          }
          else {
            return res.render("Forgot_pass", { msg: "Invalid OTP", otpsec: "YES", newpass: "NO", emailsec: "NO", title: "Forgot Password" })
          }
        }
        else {
          return res.render("Forgot_pass", { msg: "No OTP Found", otpsec: "YES", newpass: "NO", emailsec: "NO", title: "Forgot Password" })
        }
      })
      .catch((err) => console.error("Error:", err));
  }
  else {
    const mail = req.body.foremail;
    const otp = generateOTP();
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: mail,
      subject: 'Your OTP Code',
      text: `Your OTP for resetting the password is: ${otp}`
    };

    try {
      await transporter.sendMail(mailOptions);
      storeOtp(mail, otp);
      return res.render("Forgot_pass", { msg: "OTP Sent successfully!!", otpsec: "YES", newpass: "NO", emailsec: "NO", title: "Forgot Password" });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ msg: "Failed to send OTP" });
    }
  }
};

const handlefpadmin = async (req, res) => {
  const otp2 = generateOTP();
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.adminEmail,
    subject: 'Your OTP Code',
    text: `Your OTP for resetting the password is: ${otp2}`
  };

  try {
    await transporter.sendMail(mailOptions);
    storeOtp(process.env.adminEmail, otp2);
    return res.render("fpadmin", { msg: "OTP Sent successfully!!" });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ msg: "Failed to send OTP" });
  }
}

const adminPassUpdate = (req, res) => {
  if (req.body.password === req.body.password1) {
    getOtp(process.env.adminEmail)
      .then((otp) => {
        if (otp) {
          if (otp === req.body.otp) {
            process.env.adminPass = req.body.password;
            return res.render("admin", { msg: "Password Updated Successfully" })
          }
          else {
            return res.render("fpadmin", { msg: "Invalid OTP" });
          }
        }
      })
  }
  else {
    return res.render("fpadmin", { msg: "Password Mismatched" });
  }
}

const updatepass = async (req, res) => {
  if (req.body.new_password != req.body.new_password2) {
    return res.render("Forgot_pass", { msg: "Password mismatch", otpsec: "NO", newpass: "YES", emailsec: "NO", title: "Forgot Password" })
  }
  else {
    const user = await User.findOne({
      email: req.body.foremail,
    })

    console.log(user, user.username);

    if (await bcrypt.compare(user.password, req.body.new_password)) {
      return res.render("Forgot_pass", { msg: "Same password as before", otpsec: "NO", newpass: "YES", emailsec: "NO", title: "Forgot Password" })
    }
    else {
      user.password = await bcrypt.hash(req.body.new_password, 10);
      await user.save();
      await ActivityLog.create({ username: req.body.username, id: `#${Date.now()}`, message: "Your Password has been changed!!" });
      return res.render("login", { msg: "Password Updated!!", loginType: null });
    }
  }
};

const handlelogout = (req, res) => {
  res.cookie('uuid', '', { maxAge: 0 });
  return res.render("login", { loginType: null, msg: null });
}

const handleContact = (req, res) => {
  const data = {
    Name: req.body.name,
    Email: req.body.email,
    sub: req.body.subject,
    msg: req.body.message
  };
  const pat = path.resolve(`routes/Responses/${req.body.subject}/${req.body.email}.json`);
  fs.writeFile(pat, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log("Error is writing file", err);
    }
    else {
      return res.render("contact", { img: data[2], msg: "Your response is noted, we'll get back to you soon." ,currUser: data[0]})
    }
  })
}

const handleadminlogin = async (req, res) => {
  if (req.body.username === process.env.adminUsername && req.body.password === process.env.adminPass) {
    const totalUsers = await User.find({}).sort({ createdAt: -1 });
    const totalPosts = await Post.find({});
    const tickets = await Report.find({}).lean();
    const orders = await Payment.find({}).lean();
    const reviews = await Feedback.find({});
    var revenue = 0;
    orders.forEach(async order => {
      if (order.status !== "Pending") {
        revenue += Number(order.amount);
        await User.findOneAndUpdate({ username: order.username }, {$exists: false},{$set : {isPremium: true}});
      }
    });
    return res.render("adminPortal", { total_revenue: revenue, total_users: totalUsers.length, total_posts: totalPosts.length, allUsersInOrder: totalUsers, total_tickets: tickets.length, allOrders: orders, allUsers: totalUsers, allReports: tickets, allReviews: reviews });
  }
  else {
    return res.render("admin", { msg: "Incorrect Credentials" });
  }
}

const fetchOverlayUser = async (req, res) => {
  const { user_id, username, email } = req.body;
  const user = await User.findOne({ username: username });
  return res.json(user);
}

const handlegetHome = async (req, res) => {
  const { data } = req.userDetails;
  const createdAt = req.query.createdAt || new Date();
  const posts = await (
    data[3] === "Kids"
      ? channelPost.find({ createdAt: { $lt: createdAt } })
      : Post.find({ createdAt: { $lt: createdAt } })
  )
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  if (!posts) return res.status(404).json({ err: "Post not found" });

  const user = await User.findOne({ username: data[0] }).lean();
  posts.map((post) => {
    if (user.likeIds?.includes(post.id)) {
      post = { ...post, liked: true };
    }
    if (user.savedPostsIds?.includes(post.id)) {
      post = { ...post, saved: true };
    }
  })
  return res.render("home", { img: data[2], currUser: data[0], posts, type: data[3] });
}

const handlegetpayment = (req, res) => {
  const { data } = req.userDetails;
  return res.render("payment", { img: data[2], currUser: data[0] });
}

const handlegetprofile = async (req, res) => {
  const u = req.params;
  const { data } = req.userDetails;
  const profUser = await User.findOne({ username: u.username });

  if (!profUser || profUser.blockedUsers.includes(data[0])) {
    return res.render("Error_page", {
      img: data[2],
      currUser: data[0],
      error_msg: "Profile Not Found!!"
    });
  }

  const postIds = profUser.postIds || [];
  const postObjects = await Post.find({ _id: { $in: postIds } });

  const meUser = await User.findOne({ username: data[0] });
  const isFollowingThem = meUser.followings.some(f => f.username === u.username);
  const isFollowedByThem = meUser.followers.some(f => f.username === u.username);
  const isFriend = isFollowingThem && isFollowedByThem;
  const isFollower = isFollowedByThem && !isFollowingThem;
  const isRequested = isFollowingThem && !isFollowedByThem;

  const isOwnProfile = u.username === data[0];
  const isKid = profUser.type === "Kids";

  if (isKid) {
    return res.render("profile_kids", {
      img: data[2],
      myUser: profUser,
      currUser: data[0]
    });
  }

  const savedIds = profUser.savedPostsIds || [];
  const savedObjects = await Post.find({ id: { $in: savedIds } });
  const likeIds = profUser.likedPostsIds || [];
  const likedObjects = await Post.find({ id: { $in: likeIds } });
  const archiveIds = profUser.archivedPostsIds || [];
  const archivedObjects = await Post.find({ id: { $in: archiveIds } });

  if (isOwnProfile) {
    return res.render("profile", {
      img: data[2],
      myUser: profUser,
      currUser: data[0],
      posts: postObjects,
      saved: savedObjects,
      liked: likedObjects,
      archived: archivedObjects,
      isFollower,
      isFriend,
      isRequested
    });
  } else {
    if (profUser.isPremium) {
      await Notification.create({
        mainUser: u.username,
        msgSerial: 5,
        userInvolved: data[0],
        coin: 1
      });
    }
    return res.render("profile_others", {
      img: data[2],
      myUser: profUser,
      currUser: data[0],
      posts: postObjects,
      saved: savedObjects,
      liked: likedObjects,
      archived: archivedObjects,
      isFollower,
      isFriend,
      isRequested
    });
  }
};


const handlegetterms = (req, res) => {
  const { data } = req.userDetails;
  return res.render("tandc", { img: data[2], currUser: data[0] });
}

const handlegetcontact = (req, res) => {
  const { data } = req.userDetails;
  return res.render("contact", { img: data[2], msg: null, currUser: data[0] });
}

const handlegetconnect = async (req, res) => {
  const { data } = req.userDetails;

  try {
    const currentUser = await User.findOne({ username: data[0] }).populate('followings');

    const mutualFollowersPromises = currentUser.followings.map(async (user) => {
      const followedUser = await User.findOne({ username: user.username })
        .populate('followers');
      return followedUser.followers.filter(follower => follower.username !== data[0]);
    });

    const mutualFollowersArrays = await Promise.all(mutualFollowersPromises);

    let metualFollowers = [...new Set(
      mutualFollowersArrays.flat().map(user => user.username)
    )];

    const users = await User.find({ username: { $in: metualFollowers } });

    metualFollowers = users.map(user => ({
      username: user.username,
      avatarUrl: user.profilePicture,
      display_name: user.display_name,
      followers: user.followers.length,
      following: user.followings.length
    }));

    return res.render("connect", {
      img: data[2],
      currUser: data[0],
      users: metualFollowers
    });
  } catch (error) {
    console.error("Error in handlegetconnect:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const handlegetgames = (req, res) => {
  const { data } = req.userDetails;
  return res.render("games", { img: data[2], currUser: data[0] });
}

const handlegetdelacc = (req, res) => {
  const { data } = req.userDetails;
  return res.render("delacc", { img: data[2], msg: null, currUser: data[0] });
}

const handlegetadmin = (req, res) => {
  return res.render("admin", { msg: null });
}

const handlegetreels = async(req, res) => {
  const { data } = req.userDetails;

  const userType = data[3];
  let posts = await Post.find({
    type: "Reels",
  }).sort({ createdAt: -1 }).lean();

  if (!posts) return res.status(404).json({ err: "Post not found" });
  posts = await Promise.all(posts.map(async(post) => {
    const author= await User.findOne({ username: post.author }).lean();
    const isLiked=author.likedPostsIds?.includes(post.id) || false;
    return { ...post, avatar: author.profilePicture, liked: isLiked };
  }))

  return res.render("reels", { img: data[2], currUser: data[0], posts });
}

const handlegethelp = (req, res) => {
  const { data } = req.userDetails;
  return res.render("help", { img: data[2], currUser: data[0] });
}

const handlegetsignup = (req, res) => {
  return res.render("Registration", { msg: null });
}

const handlegetforgetpass = (req, res) => {
  res.render("Forgot_pass", { msg: null, newpass: "NO", otpsec: "NO", emailsec: "YES", title: "Forgot Password" });
}

const handlegeteditprofile = async (req, res) => {
  const { data } = req.userDetails;
  const user = await User.findOne({ username: data[0] });
  return res.render("edit_profile", { img: data[2], currUser: data[0], CurrentUser: user });
}

const updateUserProfile = async (req, res) => {
  const { data } = req.userDetails;
  const { photo, profileImageUrl, display_name, name, bio, gender, phone, terms } = req.body;
  await User.findOneAndUpdate(
    { username: data[0] },
    { $set: { display_name: display_name, fullName: name, bio: bio, gender: gender, phone: phone } }
  )
  if (photo !== "") {
    await User.findOneAndUpdate({ username: data[0] }, { profilePicture: profileImageUrl });
  }

  const token = create_JWTtoken([data[0], data[1], (photo !== "") ? profileImageUrl : data[2], data[3]], process.env.USER_SECRET, '30d');
  res.cookie('uuid', token, { httpOnly: true });
  await ActivityLog.create({ username: data[0], id: `#${Date.now()}`, message: "You Profile has been Updated!!" });
  return res.redirect(`/profile/${data[0]}`);
}

const handlegetpostoverlay = (req, res) => {
  return res.render("post_overlay");
}

const handlegetcreatepost = (req, res) => {
  const { data } = req.userDetails;
  return res.render("create_post", { img: data[2], currUser: data[0], msg: null });
}

const handlecreatepost = async (req, res) => {
  console.log(req.body);
  const { data } = req.userDetails;
  if (req.body.postType === "story"){
    const user = {
      username: data[0],
      url: req.body.profileImageUrl
    }
    await Story.create(user);
    return res.render("create_post", {img: data[2], currUser: data[0], msg: "story uploaded successfully"})
  }
  if (req.body.postType === "reel"){
    return res.render("create_post3", {img: data[2], currUser: data[0], post: req.body.profileImageUrl, type: req.body.postType})
  }
  else{
    return res.render("create_post_second", { img2: req.body.profileImageUrl, img: data[2], currUser: data[0], type: req.body.postType });
  }
}

const handlegetcreatepost2 = (req, res) => {
  const { data } = req.userDetails
  return res.render("create_post_second", { img2: 'https://ik.imagekit.io/FFSD0037/esrpic-609a6f96bb3031_OvyeHGHcB.jpg?updatedAt=1744145583878', currUser: data[0], img: data[2] });
}

const followSomeone = async (req, res) => {
  const { data } = req.userDetails;
  const { username } = req.params;
  try {
    await User.findOneAndUpdate(
      { username: data[0] },
      {
        $addToSet: {
          followings: {
            username: username
          }
        }
      }
    )
    await User.findOneAndUpdate(
      { username: username },
      {
        $addToSet: {
          followers: {
            username: data[0]
          }
        }
      }
    )
    await ActivityLog.create({ username: data[0], id: `#${Date.now()}`, message: `You have started following #${username}!!` });
    await User.findOneAndUpdate(
      { username: data[0] },
      {
        $inc: {
          coins: 1
        }
      }
    )
    await Notification.create({ mainUser: username, msgSerial: 1, userInvolved: data[0], coin: 1 });
    return res.json({ success: true, message: null });
  }
  catch (err) {
    console.log(err);
  }
}

const unfollowSomeone = async (req, res) => {
  const { data } = req.userDetails;
  const { username } = req.params;
  try {
    await User.findOneAndUpdate(
      { username: data[0] },
      { $pull: { followings: { username: username } } },
      { new: true }
    )
    await User.findOneAndUpdate(
      { username: username },
      { $pull: { followers: { username: data[0] } } },
      { new: true }
    )
    await ActivityLog.create({ username: data[0], id: `#${Date.now()}`, message: `You have unfollowed #${username}!!` });
    await User.findOneAndUpdate(
      { username: data[0] },
      {
        $dec: {
          coins: 1
        }
      }
    )
    await Notification.create({ mainUser: username, msgSerial: 7, userInvolved: data[0], coin: 1 });
    return res.json({ success: true, message: null });
  }
  catch (err) {
    console.log(err);
    return res.json({ success: false, message: "not succeeded" });
  }
}

const handlegetnotification = async (req, res) => {
  const { data } = req.userDetails;
  const allNotifications = await Notification.find({ mainUser: data[0] }).lean().sort({ createdAt: -1 });
  return res.render("notifications", { img: data[2], currUser: data[0], allNotifications })
}

const getSearch = async (req, res) => {
  const { data } = req.userDetails;
  const { username } = req.params;

  const usernameMatches = await User.find({
    username: { $regex: username, $options: "i" }
  }).limit(10);

  const uniqueUsernames = new Set(usernameMatches.map(u => u.username));

  let displayNameMatches = [];
  if (usernameMatches.length < 5) {
    displayNameMatches = await User.find({
      display_name: { $regex: username, $options: "i" },
      username: { $nin: [...uniqueUsernames] }
    }).limit(5 - usernameMatches.length);
  }

  const allUsers = [...usernameMatches, ...displayNameMatches];
  const userMap = new Map();
  allUsers.forEach(user => userMap.set(user.username, user));

  let users = Array.from(userMap.values())
    .filter(user => user.username !== data[0]);

  users = users.map(user => ({
    username: user.username,
    avatarUrl: user.profilePicture,
    display_name: user.display_name,
    followers: user.followers.length,
    following: user.followings.length
  }));

  return res.json({ users });
}

const handlegetsettings = async (req, res) => {
  const { data } = req.userDetails;
  const Meuser = await User.findOne({ username: data[0] });
  return res.render("settings", { img: data[2], currUser: data[0], Meuser })
}

const togglePP = async (req, res) => {
  const { data } = req.userDetails;
  await User.findOneAndUpdate({ username: data[0] }, [{ $set: { visibility: { $cond: [{ $eq: ["$visibility", "Public"] }, "Private", "Public"] } } }], { new: true });
  const Meuser = await User.findOne({ username: data[0] });
}

const signupChannel = async (req, res) => {
  const { data } = req.userDetails;
  return res.render("channelregistration", { msg: null, img: data[2], currUser: data[0] });
}

const registerChannel = async (req, res) => {
  const { data } = req.userDetails;
  console.log(req.body.selectedCategories);
  const user = await User.findOne({ username: data[0] });
  const channel = {
    channelName: req.body.channelName,
    channelDescription: req.body.channelDescription,
    channelCategory: JSON.parse(req.body.selectedCategories),
    channelLogo: req.body.profileImageUrl,
    channelAdmin: user._id,
  };
  await Channel.create(channel);
  return res.render("channelregistration", { msg: null, img: data[2], currUser: data[0] })
}

const createPostfinalize = (req, res) => {
  try{
  const {data} = req.userDetails
  console.log(req.body);
  return res.render("create_post3", {img: data[2], currUser: data[0], post: req.body.profileImageUrl, type: req.body.type});
} catch(err){ console.log(err)}
}

const handlegetlog = async (req, res) => {
  const {data} = req.userDetails;
  const allLogs = await ActivityLog.find({username: data[0]}).lean().sort({createdAt: -1});
  return res.render("activityLog", {img: data[2], currUser: data[0], allLogs})
}

const uploadFinalPost = async (req, res) => {
  const {data} = req.userDetails;
  const idd = `${data[0]}-${Date.now()}`;
  const postObj = {
    id: idd,
    type: req.body.type?"Img":"Reels",
    url: req.body.avatar,
    content: req.body.caption,
    author: data[0],
  }
  await Post.create(postObj);
  const post = await Post.findOne({id: idd}).lean();
  await User.findOneAndUpdate({username: data[0]}, {$push: {postIds: post._id}}, {new: true, upsert: false});
  return res.render("create_post", {img: data[2], currUser: data[0], msg: "post uploaded successfully"})
}

const reportAccount = async (req, res) => {
  const {data} = req.userDetails;
  const {username} = req.params;
  const report = {
    post_id: "On account",
    post_author: username,
    report_number: Number(Date.now()),
    user_reported: data[0],
  }
  await Report.create(report);
  return res.json({data: true});
}

const handlegetloginchannel = async (req, res) => {
  const {data} = req.userDetails;
  return res.render("channellogin", {img: data[2], currUser: data[0]});
}

const handleloginchannel = async (req, res) => {
  const {data} = req.userDetails;
  const {channelName, channelPassword} = req.body;
  const channel = await Channel.findOne({channelName: channelName});
  const user = await User.findOne({username: data[0]});
  if(channel && channel.channelAdmin == user._id){
    if(channel.channelPassword == channelPassword){
      return res.render("channel", {img: data[2], currUser: data[0], channel});
    }
    else{
      return res.render("channellogin", {img: data[2], currUser: data[0], msg: "Channel do not exists."});
    }
  }
}

const handlegetallnotifications = async (req, res) => {
  const { data } = req.userDetails;
  if (data){
    const allNotifications = await Notification.find({ mainUser: data[0] }).lean().sort({ createdAt: -1 });
    return res.json({allNotifications: allNotifications})
  }
  else{
    return res.json({success: false})
  }
}

const handleloginsecond = async (req, res) => {
  console.log(req.body)
  if (req.body.type === "Standard Account") {
    try {
      const user = await User.findOne(
        req.body.userTypeiden === "Email"
          ? { email: req.body.identifier }
          : { username: req.body.identifier }
      );
      if (!user) return res.json({ success: false, reason: "Invalid creds" });
      if (user.type !== "Normal") {
        return res.json({
          success: false,
          reason: "Not a Standard account, switch to respective type",
        });
      }
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordMatch)
        return res.json({ success: false, reason: "Incorrect password" });
      const token = create_JWTtoken(
        [
          user.username,
          user.email,
          user.profilePicture,
          user.type,
          user.isPremium,
        ],
        process.env.USER_SECRET,
        "30d"
      );
      res.cookie("uuid", token, { httpOnly: true });
      return res.json({ success: true });
    } catch (e) {
      console.log(e);
      return res.json({ success: false, reason: "Something went wrong" });
    }
  }
  if (req.body.type === "Child Account") {
    try {
      // console.log(req.body);
      const user = await User.findOne({ email: req.body.childEmail });
      if (!user) return res.json({ success: false, reason: "Email invalid" });
      if (user.type !== "Kids") {
        return res.json({
          success: false,
          reason: "Not a kids account, switch to respective type first",
        });
      }
      const isPasswordMatch = await bcrypt.compare(
        req.body.parentPassword,
        user.password
      );
      if (!isPasswordMatch)
        return res.json({
          success: false,
          reason: "Incorrect parent password",
        });
      const token = create_JWTtoken(
        [
          user.username,
          user.email,
          user.profilePicture,
          user.type,
          user.isPremium,
        ],
        process.env.USER_SECRET,
        "30d"
      );
      res.cookie("uuid", token, { httpOnly: true });
      return res.json({ success: true });
    } catch (e) {
      console.log(e);
      return res.json({ success: false, reason: "Something went wrong" });
    }
  }
  try {
    const user = await Channel.findOne({ channelName: req.body.channelName });
    if (!user)
      return res.json({ success: false, reason: "Invalid channel Name" });
    // console.log(user);
    const mainUser = await User.findOne({ _id: user.channelAdmin._id });
    // console.log(mainUser);
    if (mainUser.username !== req.body.adminName) {
      return res.json({ success: false, reason: "Invalid Admin name" });
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.channelPassword,
      user.channelPassword
    );
    if (!isPasswordMatch)
      return res.json({ success: false, reason: "Incorrect password" });
    const token = create_JWTtoken(
      [
        user.channelName,
        "",
        user.channelLogo,
        "Channel",
        true,
      ],
      process.env.USER_SECRET,
      "30d"
    );
    res.cookie("uuid", "", { maxAge: 0 });
    res.cookie("cuid", token, { httpOnly: true });
    return res.json({ success: true });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, reason: "Something went wrong" });
  }
};

export {
  handleSignup,
  handleLogin,
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
  handlegetforgetpass,
  handlegetsignup,
  handlegethelp,
  handlegetreels,
  handlegetdelacc,
  handlegetgames,
  handlegetadmin,
  handleadminlogin,
  generateOTP,
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
  handlegetnotification,
  getSearch,
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
  handleloginsecond
};