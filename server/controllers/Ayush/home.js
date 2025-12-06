import Channel from "../../models/channelSchema.js";
import User from "../../models/users_schema.js";
import channelPost from "../../models/channelPost.js";
import ChannelComment from "../../models/channelPost_comment.js";

// GET ALL PUBLIC CHANNEL POSTS
const getAllChannelPosts = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const identifier = data[0];
    const userType = data[3];
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 5;

    let likedPosts = [];
    let savedPosts = [];

    if (userType === "Channel") {
      const channel = await Channel.findOne({ channelName: identifier }).lean();
      if (!channel) return res.status(404).json({ success: false, message: "Channel not found" });
      likedPosts = channel.likedPostsIds || [];
      savedPosts = channel.savedPostsIds || [];
    } else {
      const user = await User.findOne({ username: identifier }).lean();
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      likedPosts = user.likedPostsIds || [];
      savedPosts = user.savedPostsIds || [];
    }

    // Fetch posts excluding current channel’s
    const posts = await channelPost
      .find({
        isArchived: false,
        channel: { $ne: identifier },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add booleans
    const enrichedPosts = posts.map(post => ({
      ...post,
      liked: likedPosts.includes(post._id.toString()),
      saved: savedPosts.includes(post._id.toString()),
    }));

    const totalCount = await channelPost.countDocuments({
      isArchived: false,
      channel: { $ne: identifier },
    });

    return res.status(200).json({
      success: true,
      posts: enrichedPosts,
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

// LIKE A CHANNEL POST
const likeChannelPost = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const identifier = data[0]; // username or channelName
    const userType = data[3];   // "Normal", "Kids", or "Channel"
    const { postId } = req.body;

    // Find the post
    const post = await channelPost.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Find the liker (could be User, Kids, or Channel)
    let likerDoc;
    if (userType === "Channel") {
      likerDoc = await Channel.findOne({ channelName: identifier });
    } else {
      likerDoc = await User.findOne({ username: identifier });
    }

    if (!likerDoc)
      return res.status(404).json({ success: false, message: "User/Channel not found" });

    // Check if already liked
    const hasLiked = likerDoc.likedPostsIds.includes(postId);

    if (hasLiked) {
      // Unlike the post
      post.likes = Math.max(0, post.likes - 1);
      await post.save();

      await likerDoc.updateOne({ $pull: { likedPostsIds: postId } });
    } else {
      // Like the post
      post.likes += 1;
      await post.save();

      await likerDoc.updateOne({ $addToSet: { likedPostsIds: postId } });
    }

    // Send updated info
    return res.json({
      success: true,
      likes: post.likes,
      liked: !hasLiked,
    });
  } catch (err) {
    console.error("❌ Error liking channel post:", err);
    return res.status(500).json({ success: false, message: "Error liking post" });
  }
};

// SAVE A CHANNEL POST
const saveChannelPost = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const identifier = data[0]; // username or channelName
    const userType = data[3];   // "Normal", "Kids", or "Channel"
    const { postId } = req.body;

    // Determine who is saving
    let saverDoc;
    if (userType === "Channel") {
      saverDoc = await Channel.findOne({ channelName: identifier });
    } else {
      saverDoc = await User.findOne({ username: identifier });
    }

    // Handle invalid case
    if (!saverDoc) {
      return res.status(404).json({
        success: false,
        message: "User or Channel not found",
      });
    }

    // Toggle saved state
    const hasSaved = saverDoc.savedPostsIds.includes(postId);

    if (hasSaved) {
      await saverDoc.updateOne({ $pull: { savedPostsIds: postId } });
    } else {
      await saverDoc.updateOne({ $addToSet: { savedPostsIds: postId } });
    }

    // Response
    return res.json({ success: true, saved: !hasSaved });
  } catch (err) {
    console.error("❌ Error saving post:", err);
    return res.status(500).json({ success: false, message: "Error saving post" });
  }
};

// COMMENT OR REPLY ON A POST
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

    const comment = await ChannelComment.create({
      postId,
      name: data[0],
      type: data[3],
      avatarUrl: data[2],
      text,
      parentCommentId: parentCommentId || null,
    });

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

// GET SINGLE POST
const getSingleChannelPost = async (req, res) => {
  try {
    const { data } = req.userDetails; // ['username' or 'channelName', ..., ..., type]
    const identifier = data[0];
    const userType = data[3];

    // Find the post by its `id` (not Mongo _id)
    const post = await channelPost.findOne({ id: req.params.id }).lean();
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    // Fetch comments (with nested replies)
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

    // Determine if this user/channel has liked or saved the post
    let likedPosts = [];
    let savedPosts = [];

    if (userType === "Channel") {
      const channel = await Channel.findOne({ channelName: identifier });
      likedPosts = channel?.likedPostsIds || [];
      savedPosts = channel?.savedPostsIds || [];
    } else {
      const user = await User.findOne({ username: identifier });
      likedPosts = user?.likedPostsIds || [];
      savedPosts = user?.savedPostsIds || [];
    }

    // Add the booleans for the current user
    const userHasLiked = likedPosts.includes(post._id.toString());
    const userHasSaved = savedPosts.includes(post._id.toString());

    return res.json({
      success: true,
      post: { ...post, userHasLiked, userHasSaved },
      comments,
    });
  } catch (err) {
    console.error("❌ Error fetching post overlay:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error loading post overlay" });
  }
};


// KIDS HOME POSTS
const getKidsHomePosts = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const username = data[0];
    const userType = data[3];

    if (userType !== "Kids") {
      return res.status(403).json({
        success: false,
        message: "Only Kids can access Kids Home",
      });
    }

    const kid = await User.findOne({ username }).lean();
    if (!kid) {
      return res.status(404).json({
        success: false,
        message: "Kids user not found",
      });
    }

    const categories = kid.kidPreferredCategories || [];

    if (!categories.length) {
      return res.status(200).json({
        success: true,
        posts: [],
        totalCount: 0,
        hasMore: false,
      });
    }

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const likedPosts = kid.likedPostsIds || [];
    const savedPosts = kid.savedPostsIds || [];

    const posts = await channelPost
      .find({
        isArchived: false,
        category: { $in: categories },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const enrichedPosts = posts.map((post) => ({
      ...post,
      liked: likedPosts.includes(post._id.toString()),
      saved: savedPosts.includes(post._id.toString()),
    }));

    const totalCount = await channelPost.countDocuments({
      isArchived: false,
      category: { $in: categories },
    });

    return res.status(200).json({
      success: true,
      posts: enrichedPosts,
      totalCount,
      hasMore: skip + limit < totalCount,
    });
  } catch (error) {
    console.error("❌ Error fetching kids home posts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  getAllChannelPosts,
  likeChannelPost,
  saveChannelPost,
  commentOnChannelPost,
  getSingleChannelPost,
  getKidsHomePosts,
};
