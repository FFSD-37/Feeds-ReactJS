import Post from "../../models/postSchema.js";
import User from "../../models/users_schema.js";

const handlegetUserPost = async (req, res) => {
    const { data } = req.userDetails;
    console.log(req.params)
    const userAsking = req.params.username;
    const user = await User.findOne({ username: userAsking });
    console.log(user);
    const posts = await Post.find({ _id: { $in: user.postIds || [] } });
    return res.json({posts: posts});
}

const handlegetBasicDetails = async (req, res) => {
    const { data } = req.userDetails;
    
}

export {
    handlegetUserPost
}