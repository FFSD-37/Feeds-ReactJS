import User from "../../models/users_schema.js";
import Channel from "../../models/channelSchema.js";
import Notification from "../../models/notification_schema.js";
import ActivityLog from "../../models/activityLogSchema.js";

// ======================
// GET /connect
// ======================
const handleGetConnect = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const [username, , , userType] = data;
    const { mode } = req.query;

    let currentUser = null;

    // 🔹 Determine source model dynamically
    if (userType === "Channel") {
      currentUser = await Channel.findOne({ channelName: username }).lean();
    } else {
      currentUser = await User.findOne({ username }).lean();
    }

    if (!currentUser)
      return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Shared variables (safe fallbacks)
    const followingUsernames = Array.isArray(currentUser.followings)
      ? currentUser.followings.map((f) => f.username)
      : [];
    const requestedUsernames = Array.isArray(currentUser.requested)
      ? currentUser.requested.map((r) => r.username)
      : [];
    const followedChannelNames = Array.isArray(currentUser.channelFollowings)
      ? currentUser.channelFollowings.map((f) => f.channelName)
      : [];

    // ===== CASE 1: Kids → show ALL channels
    if (userType === "Kids") {
      const allChannels = await Channel.find({}).lean();
      const formatted = allChannels.map((c) => ({
        type: "Channel",
        name: c.channelName,
        logo: c.channelLogo,
        category: Array.isArray(c.channelCategory) ? c.channelCategory[0] : c.channelCategory,
        members: Array.isArray(c.channelMembers) ? c.channelMembers.length : 0,
        isFollowing: followedChannelNames.includes(c.channelName),
      }));
      return res.json({ success: true, mode: "channels", items: formatted });
    }

    // ===== CASE 2: Channel user → show ALL channels (but not itself)
    if (userType === "Channel") {
      const allChannels = await Channel.find({
        channelName: { $ne: username },
      }).lean();

      const formatted = allChannels.map((c) => ({
        type: "Channel",
        name: c.channelName,
        logo: c.channelLogo,
        category: Array.isArray(c.channelCategory) ? c.channelCategory[0] : c.channelCategory,
        members: (c.channelMembers || []).length,
        isFollowing: followedChannelNames.includes(c.channelName),
      }));

      return res.json({ success: true, mode: "channels", items: formatted });
    }

    // ===== CASE 3: Normal User
    if (userType === "Normal") {
      if (mode === "channels") {
        const followedChannels = await Channel.find({
          channelName: { $in: followedChannelNames },
        }).lean();

        const formattedChannels = followedChannels.map((c) => ({
          type: "Channel",
          name: c.channelName,
          logo: c.channelLogo,
          category: Array.isArray(c.channelCategory) ? c.channelCategory[0] : c.channelCategory,
          members: (c.channelMembers || []).length,
          isFollowing: true,
        }));

        return res.json({ success: true, mode: "channels", items: formattedChannels });
      }

      const myFollowers = (currentUser.followers || []).map((f) => f.username);
      const mutualUsernames = followingUsernames.filter((u) =>
        myFollowers.includes(u)
      );

      const mutualUsers = await User.find({ username: { $in: mutualUsernames } }).lean();

      const formattedUsers = mutualUsers.map((u) => ({
        type: "User",
        username: u.username,
        avatarUrl: u.profilePicture,
        display_name: u.display_name,
        followers: (u.followers || []).length,
        following: (u.followings || []).length,
        visibility: u.visibility,
        isFollowing: followingUsernames.includes(u.username),
        requested: requestedUsernames.includes(u.username),
      }));

      return res.json({ success: true, mode: "users", items: formattedUsers });
    }

    return res.json({ success: true, mode: "users", items: [] });
  } catch (error) {
    console.error("❌ Error in handleGetConnect:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// ======================
// GET /connect/search
// ======================
const getSearch = async (req, res) => {
  try {
    const { data } = req.userDetails;
    if (!data || !data.length) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const [username, , , userType] = data;
    const { query = "", type, category = "All" } = req.query;

    let currentUser = null;
    if (userType !== "Channel") {
      currentUser = await User.findOne({ username }).lean();
      if (!currentUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    }

    const followings = currentUser?.followings || [];
    const requested = currentUser?.requested || [];
    const channelFollowings = currentUser?.channelFollowings || [];

    // ✅ Safe regex (matches all if empty)
    const regex = query && query.trim().length > 0 ? new RegExp(query, "i") : /.*/;

    // 🔹 CHANNEL SEARCH
    if (type === "channel") {
      const filter = { channelName: regex };
      if (category && category !== "All") {
        filter.channelCategory = category; 
      }

      const channels = await Channel.find(filter).limit(50).lean();
      const followedChannelNames = channelFollowings.map((c) => c.channelName);

      return res.status(200).json({
        success: true,
        items: channels.map((c) => ({
          type: "Channel",
          name: c.channelName,
          logo: c.channelLogo,
          category: Array.isArray(c.channelCategory) ? c.channelCategory[0] : c.channelCategory,
          members: Array.isArray(c.channelMembers) ? c.channelMembers.length : 0,
          isFollowing: followedChannelNames.includes(c.channelName),
        })),
      });
    }

    // 🔹 USER SEARCH
    if (userType === "Channel") {
      return res.status(200).json({
        success: true,
        items: [],
        message: "Channel accounts cannot search for users.",
      });
    }

    const found = await User.find({
      username: { $ne: username },
      $or: [{ username: regex }, { display_name: regex }],
    })
      .limit(50)
      .lean();

    const followingUsernames = followings.map((f) => f.username);
    const requestedUsernames = requested.map((r) => r.username);

    const users = found.map((u) => ({
      type: "User",
      username: u.username,
      avatarUrl: u.profilePicture,
      display_name: u.display_name,
      followers: Array.isArray(u.followers) ? u.followers.length : 0,
      following: Array.isArray(u.followings) ? u.followings.length : 0,
      visibility: u.visibility,
      isFollowing: followingUsernames.includes(u.username),
      requested: requestedUsernames.includes(u.username),
    }));

    return res.status(200).json({ success: true, items: users });
  } catch (err) {
    console.error("❌ Error in getSearch:", err);
    return res.status(500).json({
      success: false,
      message: "Error searching users or channels",
      error: err.message,
    });
  }
};

// ======================
// POST /connect/follow
// ======================
const followEntity = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const [username] = data;
    const { target, targetType } = req.body;

    // FOLLOWING A CHANNEL
    if (targetType === "Channel") {
      const channel = await Channel.findOne({ channelName: target });

      if (!channel)
        return res.status(404).json({ success: false, message: "Channel not found" });

      await Promise.all([
        User.updateOne(
          { username },
          { $addToSet: { channelFollowings: { channelName: target } } }
        ),
        Channel.updateOne(
          { channelName: target },
          { $addToSet: { channelMembers: { username } } }
        ),
      ]);

      await ActivityLog.create({
        username,
        id: `#${Date.now()}`,
        message: `You started following #${target}!!`,
      });

      await Notification.create({
        mainUser: target,
        msgSerial: 1,
        userInvolved: username,
        coin: 0,
      });

      return res.json({ success: true, status: "following" });
    }

    // FOLLOWING A NORMAL USER
    const me = await User.findOne({ username });
    const other = await User.findOne({ username: target });

    if (!other)
      return res.status(404).json({ success: false, message: "User not found" });

    // PRIVATE USER → SEND REQUEST
    if (other.visibility === "Private") {
      // REQUEST SHOULD GO TO OTHER USER
      await User.updateOne(
        { username: target },
        { $addToSet: { requested: { username } } }
      );

      await Notification.create({
        mainUser: target,
        msgSerial: 4, 
        userInvolved: username,
        coin: 0,
      });

      await ActivityLog.create({
        username,
        id: `#${Date.now()}`,
        message: `You requested to follow #${target}!!`,
      });

      return res.json({ success: true, status: "requested" });
    }

    // PUBLIC USER → FOLLOW DIRECTLY
    await Promise.all([
      User.updateOne(
        { username },
        { $addToSet: { followings: { username: target } } }
      ),
      User.updateOne(
        { username: target },
        { $addToSet: { followers: { username } } }
      ),
    ]);

    await Notification.create({
      mainUser: target,
      msgSerial: 1,
      userInvolved: username,
      coin: 0,
    });

    await ActivityLog.create({
      username,
      id: `#${Date.now()}`,
      message: `You started following #${target}!!`,
    });

    return res.json({ success: true, status: "following" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ======================
// POST /connect/unfollow
// ======================
const unfollowEntity = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const [username] = data;        // current user (who is unfollowing)
    const { target, targetType } = req.body;

    // ======================================================
    //  CASE 1 — UNFOLLOW A CHANNEL
    // ======================================================
    if (targetType === "Channel") {
      const channel = await Channel.findOne({ channelName: target });
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      // Remove follow
      await Promise.all([
        User.updateOne(
          { username },
          { $pull: { channelFollowings: { channelName: target } } }
        ),
        Channel.updateOne(
          { channelName: target },
          { $pull: { channelMembers: { username } } }
        ),
      ]);

      // Notification to channel admin
      await Notification.create({
        mainUser: target,
        msgSerial: 7, // unfollow
        userInvolved: username,
        coin: 0,
      });

      // Activity log
      await ActivityLog.create({
        username,
        id: `#${Date.now()}`,
        message: `You have unfollowed #${target}!!`,
      });

      return res.json({
        success: true,
        status: "unfollowed",
        message: `Unfollowed ${target}`,
      });
    }

    // ======================================================
    //  CASE 2 — CANCEL FOLLOW REQUEST
    // ======================================================
    const targetUser = await User.findOne({ username: target });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // detect request stored inside targetUser.requested
    const isRequested = targetUser.requested.some((r) =>
      typeof r === "string" ? r === username : r.username === username
    );

    if (isRequested) {
      // Remove the request from the target user's list
      await User.updateOne(
        { username: target },
        { $pull: { requested: { username } } }
      );

      // In case old data structure stored raw strings, remove them too
      await User.updateOne(
        { username: target },
        { $pull: { requested: username } }
      );

      // Remove old request notification
      await Notification.deleteMany({
        mainUser: target,
        userInvolved: username,
        msgSerial: 4, // follow request
      });

      return res.json({
        success: true,
        status: "request_canceled",
        message: "Follow request canceled",
      });
    }

    // ======================================================
    //  CASE 3 — NORMAL UNFOLLOW (user → user)
    // ======================================================
    await Promise.all([
      User.updateOne(
        { username },
        { $pull: { followings: { username: target } } }
      ),
      User.updateOne(
        { username: target },
        { $pull: { followers: { username } } }
      ),
    ]);

    // Send notification to unfollowed user
    await Notification.create({
      mainUser: target,
      msgSerial: 7,
      userInvolved: username,
      coin: 0,
    });

    // Log activity
    await ActivityLog.create({
      username,
      id: `#${Date.now()}`,
      message: `You have unfollowed #${target}!!`,
    });

    return res.json({
      success: true,
      status: "unfollowed",
      message: `Unfollowed @${target}`,
    });

  } catch (err) {
    console.error("❌ unfollowEntity error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { handleGetConnect, getSearch, followEntity, unfollowEntity };
