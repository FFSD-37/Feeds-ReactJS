import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: String,
      default: Date.now
    }
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;