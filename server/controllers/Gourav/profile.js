import Post from "../../models/postSchema.js";
import User from "../../models/users_schema.js";
import Channel from "../../models/channelSchema.js";

const handlegetUserPost = async (req, res) => {
    const { data } = req.userDetails;
    console.log(req.params)
    const userAsking = req.params.username;
    const user = await User.findOne({ username: userAsking });
    console.log(user);
    const posts = await Post.find({ _id: { $in: user.postIds || [] } });
    return res.json({ posts: posts });
}

const handleCheckParentalPass = async (req, res) => {
    const { data } = req.userDetails;
    const { password } = req.body;
    console.log("password" , password);
    const user = await User.findOne({ username: data[0] });
    console.log("user" , user);
    if (user.parentPassword === password) {
      return res.json({ success: true, message: "Password is correct" });
      } else {
      return res.json({ success: false, message: "Incorrect password" });
    }
}

const handlegetBasicDetails = async (req, res) => {
    const { data } = req.userDetails;
    const userAsking = req.params.username;
    console.log(req.params);
    const user = await User.findOne({ username: userAsking });
    const result = {
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        pfp: user.profilePicture,
        bio: user.bio,
        gender: user.gender,
        isPremium: user.isPremium,
        type: user.type,
        visibility: user.visibility,
        links: user.links,
        display_name: user.display_name,
        coins: user.coins,
        createdAt: user.createdAt
    }
    return res.json({ success: true, details: result });
}

const handlegetsensitive = async (req, res) => {
    const { data } = req.userDetails;
    const userAsking = req.params.username;
    const user = await User.findOne({ username: userAsking });
    const postIds = user.postIds || [];
    const posts = await Post.find({ _id: { $in: postIds }, isArchived: false }).lean();
    console.log(posts);
    // Fetch saved, liked, and archived posts
    const savedIds = user.savedPostsIds || [];
    const likedIds = user.likedPostsIds || [];
    const archiveIds = user.archivedPostsIds || [];

    const [saved, liked, archived] = await Promise.all([
        Post.find({ id: { $in: savedIds } }).lean(),
        Post.find({ id: { $in: likedIds } }).lean(),
        Post.find({ id: { $in: archiveIds } }).lean(),
    ]);
    const result = {
        followers: user.followers,
        followings: user.followings,
        posts,
        saved,
        liked,
        archived
    }
    return res.json({ success: true, details: result });
}

const handleisfriend = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const userAsking = req.params.username;

    const mainUser = await User.findOne({ username: data[0] });
    const sideUser = await User.findOne({ username: userAsking });

    if (!mainUser || !sideUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Is main following side?
    const mainFollowsSide = mainUser.followings.some(
      (u) => u.username === sideUser.username
    );

    // Did main send follow request to side?
    const mainRequestedSide = mainUser.requested.some(
      (u) => u.username === sideUser.username
    );

    // Does side follow main?
    const sideFollowsMain = sideUser.followings.some(
      (u) => u.username === mainUser.username
    );

    let relationship = "";
    let href = "";

    if (mainRequestedSide) {
      // Follow request sent
      relationship = "Requested";
      href = `/unrequest/${sideUser.username}`;
    } 
    else if (!mainRequestedSide && !mainFollowsSide) {
      // No follow / no request
      relationship = "Follow";
      href = `/follow/${sideUser.username}`;
    } 
    else if (mainFollowsSide) {
      // Already follow
      relationship = "Unfollow";
      href = `/unfollow/${sideUser.username}`;
    }

    if (sideFollowsMain && !mainFollowsSide) {
      // They follow you, you don’t follow them
      relationship = "Follow back";
      href = `/follow/${sideUser.username}`;
    }

    return res.status(200).json({ relationship, href });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCoins = async (req, res) => {
  const { data } = req.userDetails;
  const user = await User.findOne({ username: data[0] });
  return res.json({ coins: user.coins });
}

const getChannels = async (req, res) => {
  const { data } = req.userDetails;
  const user = await User.findOne({ username: data[0] });
  const channels = user.channelFollowings.map((channel) => channel.channelName);
  const channelsData = await Channel.find({ channelName: { $in: channels } });
  return res.json({ success: true, channels: channelsData });
}

export {
    handlegetUserPost,
    handlegetBasicDetails,
    handlegetsensitive,
    handleisfriend,
    handleCheckParentalPass,
    getCoins,
    getChannels,
}