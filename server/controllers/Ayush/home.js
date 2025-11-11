import Channel from "../../models/channelSchema.js";
import User from "../../models/users_schema.js";
import channelPost from "../../models/channelPost.js";
import ChannelComment from "../../models/channelPost_comment.js";

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

// POST /api/channel/like
const likeChannelPost = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const username = data[0];
    const { postId } = req.body;

    const post = await channelPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const hasLiked = post.likes.includes(username);
    if (hasLiked) {
      await channelPost.findByIdAndUpdate(postId, { $pull: { likes: username } });
      await User.findOneAndUpdate({ username }, { $pull: { likedPostsIds: postId } });
    } else {
      await channelPost.findByIdAndUpdate(postId, { $addToSet: { likes: username } });
      await User.findOneAndUpdate({ username }, { $addToSet: { likedPostsIds: postId } });
    }

    const updatedPost = await channelPost.findById(postId).lean();
    return res.json({ success: true, likes: updatedPost.likes.length, liked: !hasLiked });
  } catch (err) {
    console.error("❌ Error liking channel post:", err);
    return res.status(500).json({ success: false, message: "Error liking post" });
  }
};

// POST /api/channel/save
const saveChannelPost = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const username = data[0];
    const { postId } = req.body;

    const user = await User.findOne({ username });
    const hasSaved = user.savedPostsIds.includes(postId);

    if (hasSaved) {
      await User.findOneAndUpdate({ username }, { $pull: { savedPostsIds: postId } });
    } else {
      await User.findOneAndUpdate({ username }, { $addToSet: { savedPostsIds: postId } });
    }

    return res.json({ success: true, saved: !hasSaved });
  } catch (err) {
    console.error("❌ Error saving post:", err);
    return res.status(500).json({ success: false, message: "Error saving post" });
  }
};

const commentOnChannelPost = async (req, res) => {
  try {
    const { data } = req.userDetails; // [name, email, avatar, type]
    const { postId, text, parentCommentId } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Empty comment" });
    }

    const post = await channelPost.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Create comment
    const comment = await ChannelComment.create({
      postId,
      name: data[0],
      type: data[3],
      avatarUrl: data[2],
      text,
      parentCommentId: parentCommentId || null,
    });

    // If reply, attach to parent comment
    if (parentCommentId) {
      await ChannelComment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    return res.json({ success: true, comment });
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error adding comment" });
  }
};

// GET /api/channel/post/:id
const getSingleChannelPost = async (req, res) => {
  try {
    const post = await channelPost.findById(req.params.id).lean();
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Fetch top-level comments with nested replies (1 level deep)
    const comments = await ChannelComment.find({
      postId: post._id,
      parentCommentId: null,
    })
      .populate({
        path: "replies",
        model: "ChannelComment",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, post, comments });
  } catch (err) {
    console.error("❌ Error fetching post overlay:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error loading post overlay" });
  }
};

export {
  getAllChannelPosts,
  likeChannelPost,
  saveChannelPost,
  commentOnChannelPost,
  getSingleChannelPost
};

