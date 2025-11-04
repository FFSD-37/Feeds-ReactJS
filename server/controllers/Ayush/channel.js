import { verify_JWTtoken } from "cookie-string-parser";
import Channel from "../../models/channelSchema.js";
import channelPost from "../../models/channelPost.js";
import mongoose from "mongoose";

const handlegetchannel = async (req, res) => {
  try {
    const { channelName } = req.params;
    
    const channel = await Channel.findOne({ channelName }).lean();
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    // console.log(channel);

    const formattedChannel = {
      channel_name: channel.channelName,
      channel_description: channel.channelDescription,
      channel_logo: channel.channelLogo,
      channel_admin: channel.channelAdmin,
      channel_category: channel.channelCategory,
      channel_members: channel.channelMembers,
      channel_posts: channel.postIds,
      channel_archived: channel.archivedPostsIds,
    };

    return res.status(200).json(formattedChannel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getChannelPosts = async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: "postIds must be a non-empty array" });
    }

    const posts = await channelPost.find({ id: { $in: postIds } }).lean();

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
