import ActivityLog from "../models/activityLogSchema.js";
import channelPost from "../models/channelPost.js";
import Channel from "../models/channelSchema.js";

const categories = [
  "All",
  "Entertainment",
  "Education",
  "Animations",
  "Games",
  "Memes",
  "News",
  "Tech",
  "Vlog",
  "Sports",
  "Nature",
  "Music",
  "Marketing",
  "Fitness",
  "Lifestyle",
];

const handlechannelPostupload = async (req, res) => {
  try {
    const { data } = req.userDetails;

    if (
      !req.body?.title?.length ||
      !req.body?.url?.length ||
      !req.body?.content?.length ||
      !req.body?.category?.length ||
      !req.body?.type?.length
    )
      return res.status(400).json({ err: "All fields are required" });

    const id = `${data[0]}-${Date.now()}`;
    const channelDetails = await Channel.findOne({
      channelName: data[0],
    }).lean();

    let allowedCatogary =
      channelDetails?.channelCategory === "All"
        ? categories
        : channelDetails?.channelCategory;
    if (!allowedCatogary.includes(req.body.category))
      return res.status(400).json({ err: "Invalid category selected" });

    const postObj = {
      id,
      type: req.body.type,
      url: req.body.url,
      content: req.body.content,
      channel: data[0],
      category: req.body.category,
    };

    const post = await channelPost.create(postObj);

    await Channel.findOneAndUpdate(
      { channelName: data[0] },
      { $push: { postIds: post._id } },
      { new: true }
    );

    await ActivityLog.create({
      username: data[0],
      id: `#${Date.now()}`,
      message: `You uploaded a new ${post.type === "Reel" ? "reel" : "post"}!`,
    });

    return res.status(200).json({ msg: "Post uploaded successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error.message });
  }
};

const handleGetcategories = async (req, res) => {
  try {
    const channelDetails = await Channel.findOne({
      channelName: req.userDetails.data[0],
    }).lean();
    if (!channelDetails?.channelName?.length)
      return res.status(404).json({ err: "Channel not found" });
    return res.status(200).json({
      category:
        channelDetails?.channelCategory === "All"
          ? categories
          : channelDetails?.channelCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error.message });
  }
};

export { handlechannelPostupload, handleGetcategories };
