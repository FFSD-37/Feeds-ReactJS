import Post from "../../models/postSchema.js";
import User from "../../models/users_schema.js";

const handlegetUserPost = async (req, res) => {
    const { data } = req.userDetails;
    console.log(req.params)
    const userAsking = req.params.username;
    const user = await User.findOne({ username: userAsking });
    console.log(user);
    const posts = await Post.find({ _id: { $in: user.postIds || [] } });
    return res.json({ posts: posts });
}

const handlegetBasicDetails = async (req, res) => {
    const { data } = req.userDetails;
    const userAsking = req.params.username;
    console.log(req.params);
    const user = await User.findOne({ username: userAsking });
    const result = {
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        pfp: user.profilePicture,
        bio: user.bio,
        gender: user.gender,
        isPremium: user.isPremium,
        type: user.type,
        visibility: user.visibility,
        links: user.links,
        display_name: user.display_name,
        coins: user.coins,
        createdAt: user.createdAt
    }
    return res.json({ success: true, details: result });
}

const handlegetsensitive = async (req, res) => {
    const { data } = req.userDetails;
    const userAsking = req.params.username;
    const user = await User.findOne({ username: userAsking });
    const postIds = user.postIds || [];
    const posts = await Post.find({ _id: { $in: postIds }, isArchived: false }).lean();
    console.log(posts);
    // Fetch saved, liked, and archived posts
    const savedIds = user.savedPostsIds || [];
    const likedIds = user.likedPostsIds || [];
    const archiveIds = user.archivedPostsIds || [];

    const [saved, liked, archived] = await Promise.all([
        Post.find({ id: { $in: savedIds } }).lean(),
        Post.find({ id: { $in: likedIds } }).lean(),
        Post.find({ id: { $in: archiveIds } }).lean(),
    ]);
    const result = {
        followers: user.followers,
        followings: user.followings,
        posts,
        saved,
        liked,
        archived
    }
    return res.json({ success: true, details: result });
}

const handleisfriend = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const userAsking = req.params.username;

    const mainUser = await User.findOne({ username: data[0] });
    const sideUser = await User.findOne({ username: userAsking });

    if (!mainUser || !sideUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Now check correct way (array of objects)
    const mainFollowsSide = mainUser.followings.some(
      (u) => u.username === sideUser.username
    );

    const sideFollowsMain = sideUser.followings.some(
      (u) => u.username === mainUser.username
    );

    let relationship = "";
    let href="";

    if (!sideFollowsMain && mainFollowsSide) {
      relationship = "Requested";
      href=`/unrequest/${sideUser.username}`;
    } 
    else if (!sideFollowsMain && !mainFollowsSide) {
      relationship = "Follow";
      href=`/follow/${sideUser.username}`;
    } 
    else if (sideFollowsMain && mainFollowsSide) {
      relationship = "Unfollow";
      href=`/unfollow/${sideUser.username}`;
    } 
    else if (sideFollowsMain && !mainFollowsSide) {
      relationship = "Follow back";
    }

    return res.status(200).json({ relationship, href });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export {
    handlegetUserPost,
    handlegetBasicDetails,
    handlegetsensitive,
    handleisfriend
}