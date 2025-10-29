import Channel from "../../models/channelSchema.js";
import mongoose from "mongoose";

const create_channel = async (req, res) => {
  try {
    const {
      channelName,
      channelDescription,
      channelCategory,
      channelLogo,
      channelAdmin,
      channelMembers,
    } = req.body;

    if (!channelName || !channelDescription || !channelCategory || !channelAdmin) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const existingChannel = await Channel.findOne({ channelName: channelName.trim() });
    if (existingChannel) {
      return res.status(409).json({ error: "Channel name already exists." });
    }

    const newChannel = new Channel({
      channelName: channelName.trim(),
      channelDescription: channelDescription.trim(),
      channelCategory,
      channelLogo: channelLogo || process.env.DEFAULT_USER_IMG,
      channelAdmin: new mongoose.Types.ObjectId(channelAdmin),
      channelMembers: channelMembers || [],
      archivedPostsIds: [],
      postIds: [],
    });

    await newChannel.save();

    return res.status(201).json({
      message: "Channel created successfully!",
      channel: newChannel,
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(500).json({ error: error.message });
  }
};

const handlegetchannel = async (req, res) => {
  try {
    const { data } = req.userDetails;
    const { channelid } = req.params;

    const channel = await Channel.findById(channelid).lean();
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const posts = channel.postIds || [];
    const archived = channel.archivedPostsIds || [];

    return res.json({
      img: data[2],
      currUser: data[0],
      channel,
      type: data[3],
      posts,
      archived,
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// inside controllers/channel.js
const handlegetchannelobject = async (req, res) => {
  try {
    console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
    const name = req.params.channelid;
    const channel = await Channel.findOne({ channelName: name });
    console.log(channel);
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    return res.json({ channel });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


export { 
    create_channel, 
    handlegetchannel,
    handlegetchannelobject,
};
