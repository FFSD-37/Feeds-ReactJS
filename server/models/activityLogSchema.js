import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      required: true,
      unique: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true
  }
);

const ActivityLog = mongoose.model('Message', activityLogSchema);

export default ActivityLog;