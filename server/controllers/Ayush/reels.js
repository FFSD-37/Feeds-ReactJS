import Post from "../../models/postSchema.js";
import channelPost from "../../models/channelPost.js";
import User from "../../models/users_schema.js";
import Channel from "../../models/channelSchema.js";
import ChannelComment from "../../models/channelPost_comment.js";
import Comment from "../../models/comment_schema.js";

function markLikedSaved(reels, actor, forceType = null) {
    const liked = actor.likedPostsIds?.map(String) || [];
    const saved = actor.savedPostsIds?.map(String) || [];

    return reels.map(r => ({
        ...r,
        postType: r.postType || forceType || "normal",
        _liked: liked.includes(r._id.toString()),
        _saved: saved.includes(r._id.toString())
    }));
}

const getReelsFeed = async (req, res) => {
    try {
        const username = req.userDetails.data[0];
        const userType = req.userDetails.data[3];

        // Fetch user or channel doc
        let actor =
            userType === "Channel"
                ? await Channel.findOne({ channelName: username }).lean()
                : await User.findOne({ username }).lean();

        if (!actor) return res.json({ success: false, message: "User not found" });

        // Kids feed → only channelPost Reels, category-limited
        if (actor.type === "Kids") {
            let reels = await channelPost
                .find({
                    type: "Reels",
                    isArchived: false,
                    category: { $in: actor.kidPreferredCategories }
                })
                .sort({ createdAt: -1 })
                .lean();

            reels = markLikedSaved(reels, actor, "channel");

            return res.json({ success: true, reels });
        }

        // Channel account feed → show other channels only
        if (actor.type === "Channel") {
            const own = actor.channelName || [];

            let reels = await channelPost
                .find({
                    type: "Reels",
                    isArchived: false,
                    channel: { $nin: own }
                })
                .sort({ createdAt: -1 })
                .lean();

            reels = markLikedSaved(reels, actor, "channel");

            return res.json({ success: true, reels });
        }

        // ---------- NORMAL USER ----------
        const followedChannels = actor.channelFollowings.map(c => c.channelName);
        const followedUsers = actor.followings.map(f => f.username);

        const chReels = await channelPost
            .find({
                type: "Reels",
                isArchived: false,
                channel: { $in: followedChannels }
            })
            .lean();

        const pubReels = await Post.find({
            type: "Reels",
            isArchived: false,
            ispublic: true
        }).lean();

        const privReels = await Post.find({
            type: "Reels",
            isArchived: false,
            ispublic: false,
            author: { $in: followedUsers }
        }).lean();

        let combined = [
            ...chReels.map(r => ({ ...r, postType: "channel" })),
            ...pubReels.map(r => ({ ...r, postType: "normal" })),
            ...privReels.map(r => ({ ...r, postType: "normal" }))
        ];

        // Remove duplicates
        const seen = new Set();
        combined = combined.filter(r => {
            const id = r._id.toString();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        // Sort by newest first
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Add flags
        combined = markLikedSaved(combined, actor);

        return res.json({ success: true, reels: combined });

    } catch (err) {
        console.log("FEED ERROR:", err);
        return res.status(500).json({ success: false });
    }
};

const likeReel = async (req, res) => {
    try {
        const { postId, postType } = req.body;
        const username = req.userDetails.data[0];
        const userType = req.userDetails.data[3];

        // Model Selection
        const postModel = postType === "channel" ? channelPost : Post;
        const post = await postModel.findById(postId);
        if (!post) return res.json({ success: false, message: "Reel not found" });

        // User/Channel who liked
        const liker = userType === "Channel"
            ? await Channel.findOne({ channelName: username })
            : await User.findOne({ username });
        
        if (liker.likedPostsIds.includes(postId))
            return res.json({ success: false, message: "Already liked" });

        post.likes += 1;
        await post.save();

        await liker.updateOne({ $addToSet: { likedPostsIds: postId } });

        res.json({ success: true, likes: post.likes });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
};

const unlikeReel = async (req, res) => {
    try {
        const { postId, postType } = req.body;
        const username = req.userDetails.data[0];
        const userType = req.userDetails.data[3];

        const postModel = postType === "channel" ? channelPost : Post;
        const post = await postModel.findById(postId);

        const liker = userType === "Channel"
            ? await Channel.findOne({ channelName: username })
            : await User.findOne({ username });

        if (!liker.likedPostsIds.includes(postId))
            return res.json({ success: false, message: "Not liked" });

        post.likes = Math.max(0, post.likes - 1);
        await post.save();

        await liker.updateOne({ $pull: { likedPostsIds: postId } });

        res.json({ success: true, likes: post.likes });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
};

const saveReel = async (req, res) => {
    const { postId } = req.body;
    const username = req.userDetails.data[0];
    const userType = req.userDetails.data[3];

    const saver = userType === "Channel"
        ? await Channel.findOne({ channelName: username })
        : await User.findOne({ username });

    await saver.updateOne({ $addToSet: { savedPostsIds: postId } });

    res.json({ success: true, saved: true });
};

const unsaveReel = async (req, res) => {
    const { postId } = req.body;
    const username = req.userDetails.data[0];
    const userType = req.userDetails.data[3];

    const saver = userType === "Channel"
        ? await Channel.findOne({ channelName: username })
        : await User.findOne({ username });

    await saver.updateOne({ $pull: { savedPostsIds: postId } });

    res.json({ success: true, saved: false });
};

const commentReel = async (req, res) => {
  try {
    const { postId, postType, text } = req.body;
    if (!text.trim()) return res.json({ success: false });

    const user = req.userDetails.data;
    const username = user[0];
    const avatarUrl = user[2];
    const type = user[3];

    // ============================
    // CHANNEL COMMENT
    // ============================
    if (postType === "channel") {
      const comment = await ChannelComment.create({
        postId,
        name: username,
        avatarUrl,
        type,
        text,
      });

      // OPTIONAL: If you want to store comment IDs inside channelPost
      await channelPost.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } }
      );

      return res.json({ success: true, comment });
    }

    // ============================
    // NORMAL POST COMMENT
    // ============================
    const comment = await Comment.create({
      id: postId,
      username,
      avatarUrl,
      text,
    });

    // IMPORTANT FIX:
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id } }
    );

    return res.json({ success: true, comment });

  } catch (err) {
    console.log("COMMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
};

const replyReel = async (req, res) => {
    try {
        const { parentCommentId, postType, text } = req.body;

        const user = req.userDetails.data;
        const username = user[0];
        const avatarUrl = user[2];
        const type = user[3];

        if (postType === "channel") {
            const parent = await ChannelComment.findById(parentCommentId);
            if (!parent) return res.json({ success: false });

            const reply = await ChannelComment.create({
                postId: parent.postId,
                parentCommentId,
                name: username,
                avatarUrl,
                type,
                text,
            });

            await parent.updateOne({ $push: { replies: reply._id } });

            return res.json({ success: true, reply });
        }

        // NORMAL POST REPLY
        const parent = await Comment.findById(parentCommentId);
        if (!parent) return res.json({ success: false });

        const reply = await Comment.create({
            id: parent.id,                  // same post id
            parentCommntID: parentCommentId,
            username,
            avatarUrl,
            text,
        });

        await parent.updateOne({ $push: { reply_array: reply._id } });

        return res.json({ success: true, reply });

    } catch (err) {
        console.log("REPLY ERROR:", err);
        res.status(500).json({ success: false });
    }
};

const getReelComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const postType = req.query.postType;

    // CHANNEL REEL COMMENTS
    if (postType === "channel") {
      const comments = await ChannelComment.find({
        postId,
        parentCommentId: null,
      })
        .populate("replies")
        .sort({ createdAt: -1 });

      return res.json({ success: true, comments });
    }

    // NORMAL POST COMMENTS
    const post = await Post.findById(postId).lean();
    if (!post) return res.json({ success: false, message: "Post not found" });

    const rootCommentsIds = post.comments || [];

    const rootComments = await Comment.find({
      _id: { $in: rootCommentsIds },
      parentCommntID: null
    })
      .populate("reply_array")
      .sort({ createdAt: -1 });

    return res.json({ success: true, comments: rootComments });

  } catch (err) {
    console.log("GET COMMENTS ERROR:", err);
    res.status(500).json({ success: false });
  }
};


export {
    getReelsFeed,
    likeReel,
    unlikeReel,
    saveReel,
    unsaveReel,
    commentReel,
    replyReel,
    getReelComments,
};
