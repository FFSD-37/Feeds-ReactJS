import Channel from "../../models/channelSchema.js";
import User from "../../models/users_schema.js";
import channelPost from "../../models/channelPost.js";

// GET /getchannel/:channelName
const handlegetchannel = async (req, res) => {
  try {
    const { channelName } = req.params;

    const channel = await Channel.findOne({
      channelName: { $regex: new RegExp(`^${channelName}$`, 'i') }
    })
      .populate("channelAdmin", "username profilePicture")
      .lean();

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    return res.status(200).json({
      channel_name: channel.channelName,
      channel_description: channel.channelDescription,
      channel_logo: channel.channelLogo,
      channel_admin: channel.channelAdmin?.username || "Unknown",
      channel_admin_pic: channel.channelAdmin?.profilePicture || null,
      channel_category: channel.channelCategory,
      channel_members: channel.channelMembers,
      channel_posts: channel.postIds || [],
      channel_archived: channel.archivedPostsIds || [],
      channel_liked: channel.likedPostsIds || [],
      channel_saved: channel.savedPostsIds || [],
      channel_links: channel.links || [],

      created_at: channel.createdAt,
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
      { $addToSet: { channelMembers: { username } } }
    );

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

    await User.updateOne(
      { username },
      { $pull: { channelFollowings: { channelName } } }
    );

    await Channel.updateOne(
      { channelName },
      { $pull: { channelMembers: { username } } }
    );

    res.json({ success: true, message: `Unfollowed ${channelName}` });
  } catch (error) {
    console.error("Error unfollowing channel:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  handlegetchannel,
  getChannelPosts,
  followChannel,
  unfollowChannel,
};
