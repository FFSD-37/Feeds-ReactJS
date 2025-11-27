import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    mainUser: {
        type: String,
        required: true
    },

    mainUserType: {
        type: String,
        enum: ["Kids", "Normal", "Channel"],
        default: 'Normal'
    },

    msgSerial: {
        type: Number,
        required: true
    },
    userInvolved: {
        type: String,
        required: true
    },
    coin: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
