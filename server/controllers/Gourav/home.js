import User from "../../models/users_schema.js";

const getFriends = async (req, res) => {
    const { data } = req.userDetails;
    const user = await User.findOne({ username: data[0] });

    let friends = user.followings.filter(f => user.followers.some(fr => fr.username === f.username));console.log(friends, user);
    
    friends = await User
        .find({ username: { $in: friends.map(f => f.username) } })
        .select('username profilePicture -_id')
        .lean()
        .then(docs =>
            docs.map(({ username, profilePicture }) => ({
                username,
                avatarUrl: profilePicture
            }))
        );

    return res.status(200).json({ success: true, friends });
};

export { getFriends };