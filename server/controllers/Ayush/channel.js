import { verify_JWTtoken } from "cookie-string-parser";
import Channel from "../../models/channelSchema.js";
import channelPost from "../../models/channelPost.js";
import mongoose from "mongoose";

const handlegetchannel = async (req, res) => {
  try {
    const { channelName } = req.params;

    const channel = await Channel.findOne({ channelName })
      .populate("channelAdmin", "username profilePicture")
      .lean();

    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const formattedChannel = {
    channel_name: channel.channelName,
    channel_description: channel.channelDescription,
    channel_logo: channel.channelLogo,
    channel_admin: channel.channelAdmin?.username || "Unknown",
    channel_admin_pic: channel.channelAdmin?.profilePicture || null,
    channel_category: channel.channelCategory,
    channel_members: channel.channelMembers,
    channel_posts: channel.postIds,
    channel_archived: channel.archivedPostsIds,
    created_at: channel.createdAt,
  };


    return res.status(200).json(formattedChannel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getChannelPosts = async (req, res) => {
  try {
    const { postIds } = req.query;

    if (!postIds) {
      return res.status(400).json({ error: "Missing postIds parameter" });
    }

    const idsArray = postIds.split(",");
    const posts = await channelPost.find({ _id: { $in: idsArray } }).lean();

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching channel posts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export {
  handlegetchannel,
  getChannelPosts
};
