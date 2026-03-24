import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import User from "../models/users_schema.js";
import Channel from "../models/channelSchema.js";
import Post from "../models/postSchema.js";
import channelPost from "../models/channelPost.js";
import Adpost from "../models/ad_schema.js";
import Story from "../models/storiesSchema.js";
import Comment from "../models/comment_schema.js";
import Report from "../models/reports.js";
import ActivityLog from "../models/activityLogSchema.js";

const adType = new GraphQLObjectType({
  name: "HomeAd",
  fields: {
    _id: { type: GraphQLString },
    url: { type: GraphQLString },
    ad_url: { type: GraphQLString },
  },
});

const friendType = new GraphQLObjectType({
  name: "HomeFriend",
  fields: {
    username: { type: GraphQLString },
    avatarUrl: { type: GraphQLString },
  },
});

const channelType = new GraphQLObjectType({
  name: "HomeChannel",
  fields: {
    _id: { type: GraphQLString },
    channelName: { type: GraphQLString },
    channelLogo: { type: GraphQLString },
  },
});

const storyType = new GraphQLObjectType({
  name: "HomeStory",
  fields: {
    _id: { type: GraphQLString },
    username: { type: GraphQLString },
    url: { type: GraphQLString },
    likes: { type: GraphQLInt },
    avatarUrl: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

const postType = new GraphQLObjectType({
  name: "HomePost",
  fields: {
    _id: { type: GraphQLString },
    id: { type: GraphQLString },
    type: { type: GraphQLString },
    url: { type: GraphQLString },
    content: { type: GraphQLString },
    author: { type: GraphQLString },
    authorAvatar: { type: GraphQLString },
    likes: { type: GraphQLInt },
    commentCount: { type: GraphQLInt },
    liked: { type: GraphQLBoolean },
    saved: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

const homeFeedType = new GraphQLObjectType({
  name: "HomeFeed",
  fields: {
    posts: { type: new GraphQLList(postType) },
    friends: { type: new GraphQLList(friendType) },
    ads: { type: new GraphQLList(adType) },
    channels: { type: new GraphQLList(channelType) },
    stories: { type: new GraphQLList(storyType) },
  },
});

const commentType = new GraphQLObjectType({
  name: "HomeComment",
  fields: {
    _id: { type: GraphQLString },
    username: { type: GraphQLString },
    avatarUrl: { type: GraphQLString },
    text: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

const commentThreadType = new GraphQLObjectType({
  name: "HomeCommentThread",
  fields: {
    main: { type: commentType },
    replies: { type: new GraphQLList(commentType) },
  },
});

const addCommentPayloadType = new GraphQLObjectType({
  name: "AddCommentPayload",
  fields: {
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    comment: { type: commentType },
    commentCount: { type: GraphQLInt },
  },
});

const simpleActionPayloadType = new GraphQLObjectType({
  name: "SimpleActionPayload",
  fields: {
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    reportId: { type: GraphQLString },
  },
});

const addReplyPayloadType = new GraphQLObjectType({
  name: "AddReplyPayload",
  fields: {
    success: { type: GraphQLBoolean },
    reply: { type: commentType },
  },
});

async function getCurrentUser(req) {
  const username = req.userDetails?.data?.[0];
  if (!username) {
    throw new Error("Unauthorized");
  }

  const user = await User.findOne({ username }).lean();
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

async function getActor(req) {
  const identifier = req.userDetails?.data?.[0];
  const type = req.userDetails?.data?.[3];

  if (!identifier || !type) {
    throw new Error("Unauthorized");
  }

  if (type === "Channel") {
    const channel = await Channel.findOne({ channelName: identifier });
    if (!channel) {
      throw new Error("Channel not found");
    }

    return { actor: channel, type, identifier };
  }

  const user = await User.findOne({ username: identifier });
  if (!user) {
    throw new Error("User not found");
  }

  return { actor: user, type, identifier };
}

async function getFriendsForUser(user) {
  const mutualUsernames = user.followings
    .filter(following =>
      user.followers.some(follower => follower.username === following.username),
    )
    .map(friend => friend.username);

  const friends = await User.find({
    username: { $in: mutualUsernames },
  })
    .select("username profilePicture -_id")
    .lean();

  return friends.map(({ username, profilePicture }) => ({
    username,
    avatarUrl: profilePicture,
  }));
}

async function getStoriesForUser(friends) {
  if (friends.length === 0) {
    return [];
  }

  const stories = await Story.find({
    username: { $in: friends.map(friend => friend.username) },
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
    .sort({ createdAt: -1 })
    .lean();

  return stories.map(story => ({
    ...story,
    avatarUrl:
      friends.find(friend => friend.username === story.username)?.avatarUrl || "",
  }));
}

async function getPostsForUser(user, req) {
  const createdAt = req.query.createdAt || new Date();
  const userType = req.userDetails?.data?.[3];

  let posts = await (
    userType === "Kids"
      ? channelPost.find({ createdAt: { $lt: createdAt } })
      : Post.find({ createdAt: { $lt: createdAt } })
  )
    .sort({ createdAt: -1 })
    .lean();

  if (userType === "Kids") {
    return posts.map(post => ({
      ...post,
      id: post.id || post._id?.toString(),
      author: post.author || post.channel,
      authorAvatar: post.channelLogo || "",
      commentCount: Array.isArray(post.comments) ? post.comments.length : 0,
      liked: user.likedPostsIds?.includes(post._id?.toString()),
      saved: user.savedPostsIds?.includes(post._id?.toString()),
    }));
  }

  const authors = [...new Set(posts.map(post => post.author).filter(Boolean))];
  const authorDocs = await User.find({
    username: { $in: authors },
  })
    .select("username profilePicture -_id")
    .lean();

  const avatarByAuthor = new Map(
    authorDocs.map(({ username, profilePicture }) => [username, profilePicture]),
  );

  return posts.map(post => ({
    ...post,
    commentCount: Array.isArray(post.comments) ? post.comments.length : 0,
    liked: user.likedPostsIds?.includes(post.id?.toString()) || false,
    saved: user.savedPostsIds?.includes(post.id?.toString()) || false,
    authorAvatar: avatarByAuthor.get(post.author) || process.env.DEFAULT_USER_IMG,
  }));
}

async function getCommentThreads(postId) {
  const post = await Post.findOne({ id: postId }).lean();

  if (!post) {
    throw new Error("Post not found");
  }

  const threads = [];

  for (const commentId of post.comments || []) {
    const main = await Comment.findOne({ _id: commentId }).lean();
    if (!main) {
      continue;
    }

    const replies = [];
    for (const replyId of main.reply_array || []) {
      const reply = await Comment.findOne({ _id: replyId }).lean();
      if (reply) {
        replies.push(reply);
      }
    }

    threads.push({ main, replies });
  }

  return threads;
}

const togglePostPayloadType = new GraphQLObjectType({
  name: "TogglePostPayload",
  fields: {
    success: { type: GraphQLBoolean },
    id: { type: GraphQLString },
    liked: { type: GraphQLBoolean },
    saved: { type: GraphQLBoolean },
    likes: { type: GraphQLInt },
  },
});

async function getChannelsForUser(user) {
  const followedChannels = user.channelFollowings.map(
    channel => channel.channelName,
  );

  return Channel.find({
    channelName: { $in: followedChannels },
  })
    .select("channelName channelLogo")
    .lean();
}

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    homeFeed: {
      type: homeFeedType,
      resolve: async (_, __, { req }) => {
        const user = await getCurrentUser(req);
        const friends = await getFriendsForUser(user);

        const [posts, ads, channels, stories] = await Promise.all([
          getPostsForUser(user, req),
          Adpost.find({}).lean(),
          getChannelsForUser(user),
          getStoriesForUser(friends),
        ]);

        return {
          posts,
          friends,
          ads,
          channels,
          stories,
        };
      },
    },
    postComments: {
      type: new GraphQLList(commentThreadType),
      args: {
        postId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { postId }, { req }) => {
        await getCurrentUser(req);
        return getCommentThreads(postId);
      },
    },
  },
});

const mutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    toggleLikePost: {
      type: togglePostPayloadType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { postId }, { req }) => {
        const { actor } = await getActor(req);
        const post = await Post.findOne({ id: postId });

        if (!post) {
          throw new Error("Post not found");
        }

        const hasLiked = actor.likedPostsIds?.includes(postId);

        if (hasLiked) {
          actor.likedPostsIds = actor.likedPostsIds.filter(id => id !== postId);
          post.likes = Math.max(0, (post.likes || 0) - 1);
        } else {
          actor.likedPostsIds = [...(actor.likedPostsIds || []), postId];
          post.likes = (post.likes || 0) + 1;
        }

        await actor.save();
        await post.save();

        return {
          success: true,
          id: postId,
          liked: !hasLiked,
          saved: actor.savedPostsIds?.includes(postId) || false,
          likes: post.likes,
        };
      },
    },
    toggleSavePost: {
      type: togglePostPayloadType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { postId }, { req }) => {
        const { actor } = await getActor(req);
        const post = await Post.findOne({ id: postId }).select("id likes");

        if (!post) {
          throw new Error("Post not found");
        }

        const hasSaved = actor.savedPostsIds?.includes(postId);

        actor.savedPostsIds = hasSaved
          ? actor.savedPostsIds.filter(id => id !== postId)
          : [...(actor.savedPostsIds || []), postId];

        await actor.save();

        return {
          success: true,
          id: postId,
          liked: actor.likedPostsIds?.includes(postId) || false,
          saved: !hasSaved,
          likes: post.likes || 0,
        };
      },
    },
    addPostComment: {
      type: addCommentPayloadType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLString) },
        commentText: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { postId, commentText }, { req }) => {
        const { actor, type, identifier } = await getActor(req);
        const text = commentText.trim();

        if (!text) {
          throw new Error("Comment cannot be empty");
        }

        const post = await Post.findOne({ id: postId });
        if (!post) {
          throw new Error("Post not found");
        }

        const comment = await Comment.create({
          text,
          username: identifier,
          avatarUrl:
            type === "Channel"
              ? actor.channelLogo || process.env.DEFAULT_USER_IMG
              : actor.profilePicture || process.env.DEFAULT_USER_IMG,
          postID: post._id,
          reply_array: [],
        });

        post.comments = [...(post.comments || []), comment._id];
        await post.save();

        return {
          success: true,
          message: "Comment added successfully",
          comment,
          commentCount: post.comments.length,
        };
      },
    },
    addCommentReply: {
      type: addReplyPayloadType,
      args: {
        commentId: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLString) },
        replyText: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { commentId, postId, replyText }, { req }) => {
        const { actor, type, identifier } = await getActor(req);
        const text = replyText.trim();

        if (!text || !commentId || !postId) {
          throw new Error("Missing required fields");
        }

        const post = await Post.findOne({ id: postId }).select("id");
        if (!post) {
          throw new Error("Post not found");
        }

        const reply = await Comment.create({
          text,
          parentCommntID: commentId,
          username: identifier,
          avatarUrl:
            type === "Channel"
              ? actor.channelLogo || process.env.DEFAULT_USER_IMG
              : actor.profilePicture || process.env.DEFAULT_USER_IMG,
        });

        const parentComment = await Comment.findOneAndUpdate(
          { _id: commentId },
          { $push: { reply_array: reply._id } },
          { new: true },
        );

        if (!parentComment) {
          throw new Error("Parent comment not found");
        }

        return {
          success: true,
          reply,
        };
      },
    },
    reportPost: {
      type: simpleActionPayloadType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLString) },
        reason: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { postId, reason }, { req }) => {
        const reporterUsername = req.userDetails?.data?.[0];
        if (!reporterUsername) {
          throw new Error("Unauthorized");
        }

        const [userPost, reportedChannelPost] = await Promise.all([
          Post.findOne({ id: postId }),
          channelPost.findOne({ id: postId }),
        ]);

        if (!userPost && !reportedChannelPost) {
          throw new Error("Post not found");
        }

        const isChannelPost = Boolean(reportedChannelPost);
        const reportNumber = Date.now();
        const reportedOwner = isChannelPost
          ? reportedChannelPost.channel
          : userPost.author;

        const report = await Report.create({
          report_id: isChannelPost ? 4 : 3,
          post_id: postId,
          report_number: reportNumber,
          user_reported: reportedOwner,
          reason,
          status: "Pending",
        });

        await ActivityLog.create({
          username: reporterUsername,
          id: `#${reportNumber}`,
          message: `You reported a post by @${reportedOwner} for "${reason}".`,
        });

        return {
          success: true,
          message: "Post reported successfully.",
          reportId: report._id.toString(),
        };
      },
    },
    reportComment: {
      type: simpleActionPayloadType,
      args: {
        commentId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { commentId }, { req }) => {
        const reporterUsername = req.userDetails?.data?.[0];
        if (!reporterUsername) {
          throw new Error("Unauthorized");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
          throw new Error("Comment not found");
        }

        const isChannelComment = Boolean(
          await Channel.findOne({ channelName: comment.username }).select(
            "channelName",
          ),
        );
        const reportNumber = Date.now();
        const report = await Report.create({
          report_id: isChannelComment ? 6 : 5,
          post_id: commentId,
          report_number: reportNumber,
          user_reported: comment.username,
          reason: "REPORT",
          status: "Pending",
        });

        await ActivityLog.create({
          username: reporterUsername,
          id: `#${reportNumber}`,
          message: "You reported a comment.",
        });

        return {
          success: true,
          message: "comment reported successfully",
          reportId: report._id.toString(),
        };
      },
    },
  },
});

const homeSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export default homeSchema;
