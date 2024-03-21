import mongoose from "mongoose";

//chat between 2 users
const ChatSchema = mongoose.Schema({
    participant_one: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    participant_two: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

export const Chat = mongoose.model("Chat", ChatSchema)