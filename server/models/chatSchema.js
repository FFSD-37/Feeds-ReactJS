import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true
    },
    fromType: {
      type: String,
      enum: ["Normal", "Kids", "Channel"],
      default: "Normal",
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    toType: {
      type: String,
      enum: ["Normal", "Kids", "Channel"],
      default: "Normal",
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    seen: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: String,
      default: Date.now
    }
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
