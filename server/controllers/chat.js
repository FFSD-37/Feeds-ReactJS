import Chat from "../models/chatSchema.js";
import User from "../models/users_schema.js";

const getFriendList = async (req, res) => {
  const { data } = req.userDetails;
  const user = await User.findOne({ username: data[0] });

  let friends = user.followings.filter((f) =>
    user.followers.some((fr) => fr.username === f.username)
  );

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

  return res.json({ friends });
};

const getChat = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const { username } = req.params;

    const chats = await Chat.find({
      $or: [
        { from: data[0], to: username },
        { to: data[0], from: username },
      ],
    }).sort({ createdAt: 1 });

    return res.json({ chats });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

export { getChat, getFriendList };
