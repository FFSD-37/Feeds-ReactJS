import { verify_JWTtoken } from "cookie-string-parser";
import channelPost from "../models/channelPost.js";
import Channel from "../models/channelSchema.js";

const handlechannelPostupload=async(req,res)=>{
    try {
    const authorDetails=verify_JWTtoken(req.cookies.uuid, process.env.USER_SECRET);
    
    if(!authorDetails) return res.status(401).json({ err: "Unauthorized" });
    if(!req.body.title || !req.body.url || !req.body.content) return res.status(400).json({ err: "All fields are required" });

    const id=`${authorDetails.data[0]}-${Date.now()}`

    await Channel.updateOne({ username: authorDetails.data[0] }, { $push: { postIds: id } });
    await channelPost.insertOne({
        id,
        title:req.body.title,
        url:req.body.url,
        content:req.body.content,
        author:authorDetails.data[0],
        avatarUrl:authorDetails.data[2]
    });

    return res.status(200).json({ msg: "Post uploaded successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ err: error.message });
    }
};

export {handlechannelPostupload};