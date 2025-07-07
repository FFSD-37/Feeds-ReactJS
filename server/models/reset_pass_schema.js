import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true // Automatically generates a new ObjectId
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true }); // adds createdAt & updatedAt

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);

export default ResetPassword;
