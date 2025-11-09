import Channel from "../../models/channelSchema.js";
import channelPost from "../../models/channelPost.js";

const getAllChannelPosts = async (req, res) => {
  try {
    const { data } = req.userDetails; // ['Ayush', 'ayush', logo, 'Channel', true]
    const channelName = data[0];
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 5;

    // Check if current channel exists
    const currentChannel = await Channel.findOne({ channelName }).lean();
    if (!currentChannel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    // Fetch posts that are:
    // 1. Not archived
    // 2. Not created by this user's channel
    const posts = await channelPost
      .find({
        isArchived: false,
        channel: { $ne: channelName },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await channelPost.countDocuments({
      isArchived: false,
      channel: { $ne: channelName },
    });

    return res.status(200).json({
      success: true,
      posts,
      totalCount,
      hasMore: skip + limit < totalCount,
    });
  } catch (error) {
    console.error("❌ Error fetching public channel posts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { getAllChannelPosts };
