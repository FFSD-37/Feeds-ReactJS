import Channel from "../../models/channelSchema.js";
import User from "../../models/users_schema.js";
import channelPost from "../../models/channelPost.js";
import ChannelComment from "../../models/channelPost_comment.js";
import Notification from "../../models/notification_schema.js";

// GET /getchannel/:channelName
// GET /getchannel/:channelName
const handlegetchannel = async (req, res) => {
  try {
    const { channelName } = req.params;
    const { data } = req.userDetails || {};
    console.log("data:", data);

    // data = [channelName, adminName, logo, type, isPremium]
    // data = [username, email, profileUrl, type, isPremium]

    const channel = await Channel.findOne({
      channelName: { $regex: new RegExp(`^${channelName}$`, "i") }
    })
      .populate("channelAdmin", "username profilePicture")
      .populate("channelMembers", "username profilePicture")
      .lean();

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // 🔔 PREVENT SELF-VIEW NOTIFICATION
    if (data[3] === "Channel" && data[1] === channel.channelName) {
      // skip creating notification
    } else {
      // 🔔 CREATE NOTIFICATION
      let msgSerial = data[3] === "Channel" ? 17 : 18;

      let userInvolved = data[0]; 
      await Notification.create({
        mainUser: channel.channelName,
        mainUserType: "Channel",
        msgSerial,
        userInvolved,
      });
    }

    return res.status(200).json({
      channel_name: channel.channelName,
      channel_description: channel.channelDescription,
      channel_logo: channel.channelLogo,
      channel_admin: channel.channelAdmin?.username || "Unknown",
      channel_admin_pic: channel.channelAdmin?.profilePicture || null,
      channel_category: channel.channelCategory,
      channel_members: channel.channelMembers?.map(m => ({
        username: m.username,
        profilePicture: m.profilePicture
      })) || [],
      channel_posts: channel.postIds || [],
      channel_archived: channel.archivedPostsIds || [],
      channel_liked: channel.likedPostsIds || [],
      channel_saved: channel.savedPostsIds || [],
      channel_links: channel.links || [],
      created_at: channel.createdAt
    });

  } catch (error) {
    console.error("❌ Error fetching channel:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /getchannelposts
const getChannelPosts = async (req, res) => {
  try {
    const { postIds } = req.query;
    if (!postIds) return res.status(400).json({ error: "Missing postIds" });

    const idsArray = postIds.split(",").map(id => id.trim());

    const posts = await channelPost.find({
      $or: [
        { _id: { $in: idsArray } },
        { id: { $in: idsArray } }
      ]
    }).lean();

    return res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Error fetching channel posts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /follow_channel/:channelName
const followChannel = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const username = data[0];
    const userType = data[3];
    const { channelName } = req.params;

    if (userType === "Channel") {
      return res
        .status(400)
        .json({ success: false, message: "Channels cannot follow other channels" });
    }

    const user = await User.findOne({ username });
    const channel = await Channel.findOne({ channelName });

    if (!channel)
      return res.status(404).json({ success: false, message: "Channel not found" });

    const alreadyFollowing = user.channelFollowings.some(
      f => f.channelName === channelName
    );

    if (alreadyFollowing) {
      return res.json({ success: false, message: "Already following" });
    }

    await User.updateOne(
      { username },
      { $addToSet: { channelFollowings: { channelName } } }
    );

    await Channel.updateOne(
      { channelName },
      { $addToSet: { channelMembers: user._id } }
    );

    await Notification.create({
      mainUser: channelName,
      mainUserType: "Channel",
      msgSerial: 9, // Normal/kids user follows a channel
      userInvolved: username,
    });

    res.json({ success: true, message: `Now following ${channelName}` });
  } catch (error) {
    console.error("Error following channel:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /unfollow_channel/:channelName
const unfollowChannel = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const username = data[0];
    const userType = data[3];
    const { channelName } = req.params;

    if (userType === "Channel") {
      return res
        .status(400)
        .json({ success: false, message: "Channels cannot unfollow channels" });
    }

    const user = await User.findOne({ username });

    await User.updateOne(
      { username },
      { $pull: { channelFollowings: { channelName } } }
    );

    await Channel.updateOne(
      { channelName },
      { $pull: { channelMembers: user._id } }
    );

    await Notification.create({
      mainUser: channelName,
      mainUserType: "Channel",
      msgSerial: 10, // Normal/kids user unfollows a channel
      userInvolved: username,
    });

    res.json({ success: true, message: `Unfollowed ${channelName}` });
  } catch (error) {
    console.error("Error unfollowing channel:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const archivePost = async (req, res) => {
  try {
    const { postId } = req.params; // this is custom id (string)

    // 1️⃣ get channel
    const channel = await Channel.findOne({
      channelName: req.userDetails.data[0]
    });

    if (!channel)
      return res.status(404).json({ message: "Channel not found" });

    // 2️⃣ Find post using "id" and get "_id"
    const post = await channelPost.findOne({ id: postId });
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    const mongoId = post._id.toString(); // actual ID stored in your channel arrays

    // 3️⃣ Check if this post belongs to channel
    if (!channel.postIds.includes(mongoId)) {
      return res.status(403).json({ message: "Not your post" });
    }

    // 4️⃣ Move from postIds → archivedPostsIds
    channel.archivedPostsIds.push(mongoId);
    channel.postIds = channel.postIds.filter(id => id !== mongoId);

    // remove from liked / saved if needed
    channel.likedPostsIds = channel.likedPostsIds.filter(id => id !== mongoId);
    channel.savedPostsIds = channel.savedPostsIds.filter(id => id !== mongoId);

    // 5️⃣ update archive flag
    post.isArchived = true;

    await channel.save();
    await post.save();

    return res.json({ message: "Archived successfully" });

  } catch (err) {
    console.log("ARCHIVE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const unarchivePost = async (req, res) => {
  try {
    const { postId } = req.params; // custom id

    // 1️⃣ Get channel by channelName
    const channel = await Channel.findOne({
      channelName: req.userDetails.data[0]
    });

    if (!channel)
      return res.status(404).json({ message: "Channel not found" });

    // 2️⃣ Find post using custom id → get Mongo _id
    const post = await channelPost.findOne({ id: postId });
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    const mongoId = post._id.toString();

    // 3️⃣ Ensure it's in archived list
    if (!channel.archivedPostsIds.includes(mongoId)) {
      return res.status(403).json({ message: "Post is not archived" });
    }

    // 4️⃣ Move archived → posts
    channel.postIds.push(mongoId);
    channel.archivedPostsIds = channel.archivedPostsIds.filter(
      id => id !== mongoId
    );

    // 5️⃣ Update post flag
    post.isArchived = false;

    await channel.save();
    await post.save();

    return res.json({ message: "Unarchived successfully" });
  } catch (err) {
    console.log("UNARCHIVE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params; // custom id (Ayush-xxxx)

    // 🔍 1️⃣ Fetch the channel
    const channel = await Channel.findOne({
      channelName: req.userDetails.data[0]
    });

    if (!channel)
      return res.status(404).json({ message: "Channel not found" });

    // 🔍 2️⃣ Find the post using custom id
    const post = await channelPost.findOne({ id: postId });
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    const mongoId = post._id.toString();

    // 🧹 3️⃣ Remove post from channel arrays
    channel.postIds = channel.postIds.filter(id => id !== mongoId);
    channel.archivedPostsIds = channel.archivedPostsIds.filter(id => id !== mongoId);
    channel.likedPostsIds = channel.likedPostsIds.filter(id => id !== mongoId);
    channel.savedPostsIds = channel.savedPostsIds.filter(id => id !== mongoId);

    await channel.save();

    // 🗑️ 4️⃣ Remove post from every user's liked/saved lists
    await User.updateMany(
      {},
      {
        $pull: {
          likedChannelPosts: mongoId,
          savedChannelPosts: mongoId
        }
      }
    );

    // 🧹 5️⃣ Delete all comments of this post (including replies)
    await ChannelComment.deleteMany({ postId: mongoId });

    // 🗑️ 6️⃣ Delete the post itself
    await channelPost.findOneAndDelete({ id: postId });

    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  handlegetchannel,
  getChannelPosts,
  followChannel,
  unfollowChannel,
  archivePost,
  unarchivePost,
  deletePost,
};
