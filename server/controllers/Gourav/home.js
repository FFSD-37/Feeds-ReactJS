import User from "../../models/users_schema.js";
import Adpost from "../../models/ad_schema.js";
import Post from "../../models/postSchema.js";
import Comment from "../../models/comment_schema.js";

const getFriends = async (req, res) => {
  const { data } = req.userDetails;
  const user = await User.findOne({ username: data[0] });

  let friends = user.followings.filter((f) =>
    user.followers.some((fr) => fr.username === f.username)
  );
  console.log(friends, user);

  friends = await User.find({
    username: { $in: friends.map((f) => f.username) },
  })
    .select("username profilePicture -_id")
    .lean()
    .then((docs) =>
      docs.map(({ username, profilePicture }) => ({
        username,
        avatarUrl: profilePicture,
      }))
    );

  return res.status(200).json({ success: true, friends });
};

const handlegetads = async (req, res) => {
  const ads = await Adpost.find({}).lean();
  return res.json({ success: true, allAds: ads });
};

const handlegetComments = async (req, res) => {
  const postID = req.body.postID;
  const post = await Post.findOne({ id: req.body.postID });
  let comment_array = [];
  for (let i = 0; i < post.comments.length; i++) {
    const comment = await Comment.findOne({ _id: post.comments[i] });
    let reply_array = [];
    if (comment?.reply_array.length > 0) {
      for (let j = 0; j < comment.reply_array.length; j++) {
        reply_array.push(
          await Comment.findOne({ _id: comment.reply_array[j] })
        );
      }
    }
    comment_array.push([comment, reply_array]);
  }

  return res.json({success:true, comment_array});
};

export { getFriends, handlegetads, handlegetComments };
