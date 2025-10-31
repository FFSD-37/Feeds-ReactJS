import Post from "../../models/postSchema.js";
import User from "../../models/users_schema.js";

const handlegetUserPost = async (req, res) => {
    const { data } = req.userDetails;
    const { userAsking } = req.params.username;
    const user = await User.findOne({ username: userAsking });
    const posts = await Post.find({ _id: { $in: user.postIds || [] } });
    return res.json({posts: posts});
}

export {
    handlegetUserPost
}