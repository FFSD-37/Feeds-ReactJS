import mongoose from 'mongoose';

const validChannelCategories = [
    "Entertainment", "Education", "Animations", "Games", "Memes",
    "News", "Tech", "Vlog", "Sports", "Nature", "Music", "Marketing",
    "Fitness", "Lifestyle"
];

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: [true, "Username already exists"],
        trim: true
    },

    display_name: {
        type: String,
        default: function () {
            return this.fullName;
        }
    },

    email: {
        type: String,
        required: true,
        unique: [true, "Email already exists"],
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    dob: {
        type: Date,
        required: true
    },

    visibility: {
        type: String,
        enum: ["Public", "Private"],
        default: "Public"
    },

    profilePicture: {
        type: String,
        default: process.env.DEFAULT_USER_IMG
    },

    followers: [{
        username: {
            type: String
        }
    }],

    requested: [{
        username: {
            type: String
        }
    }],

    followings: [{
        username: {
            type: String
        }
    }],

    channelFollowings: [{
        channelName: {
            type: String
        }
    }],

    blockedUsers: [{
        type: String
    }],

    bio: {
        type: String,
        trim: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    termsAccepted: {
        type: Boolean,
        default: false
    },

    isPremium: {
        type: Boolean,
        default: false
    },

    coins: {
        type: Number,
        default: 0
    },

    type: {
        type: String,
        enum: ["Kids", "Normal", "Admin"],
        default: 'Normal'
    },

    links: [{
        type: String
    }],

    savedPostsIds: [{
        type: String
    }],

    likedPostsIds: [{
        type: String
    }],

    likedStoriesIds: [{
        type: String
    }],

    archivedPostsIds: [{
        type: String
    }],

    postIds: [{
        type: String
    }],

    socketId: {
        type: String,
        default: null
    },

    channelName: [{
        type: String
    }],
    parentPassword: {
        type: String,
        required: function () {
            return this.type === "Kids";
        },
        default: null
    },

    timeLimit: {
        type: Number,
        required: function () {
            return this.type === "Kids";
        },
        default: 180
    },

    kidPreferredCategories: {
        type: [String],
        validate: {
            validator: function (categories) {
                if (this.type !== "Kids") return true;
                return categories.every(cat => validChannelCategories.includes(cat));
            },
            message: "Invalid category found in kidPreferredCategories"
        },
        default: []
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;