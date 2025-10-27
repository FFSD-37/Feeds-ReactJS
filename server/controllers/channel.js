import Channel from "../models/channelSchema.js";
import mongoose from "mongoose";

const create_channel = async (req, res) => {
    try {
        const {
            channelName,
            channelDescription,
            channelCategory,
            channelLogo,
            channelAdmin,
            channelMembers
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
            savedPostsIds: [],
            likedPostsIds: [],
            archivedPostsIds: [],
            postIds: []
        });

        await newChannel.save();

        return res.status(201).json({
            message: "Channel created successfully!",
            channel: newChannel
        });

    } catch (error) {
        console.error("Error creating channel:", error);
        return res.status(500).json({ error: error.message });
    }
};

export { create_channel };
