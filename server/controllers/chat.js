import {Chat, ChatMessage} from "../models/index.js";

async function create(req,res) {
    const {participant_id_one, participant_id_two} = req.body;
    const foundOne = await Chat.findOne({
        participant_one: participant_id_one,
        participant_two: participant_id_two,
    });
    const foundTwo = await Chat.findOne({
        participant_one: participant_id_two,
        participant_two: participant_id_one,
    });
    if(foundOne || foundTwo) {
        res.status(200).send({msg: "You already have a chat with this user"});
        return;
    }
    const chat = new Chat({
        participant_one: participant_id_one,
        participant_two: participant_id_two,
    });
    try {
        const chatStorage = await chat.save();
        res.status(200).send(chatStorage);
    } catch (error) {
        res.status(400).send({msg: "Error creating chat"});
    }
}

async function getAll(req, res) {
    const { user_id } = req.user;
    try {
        const chats = await Chat.find({
            $or: [{ participant_one : user_id}, {participant_two : user_id}],
        })
        .populate("participant_one")
        .populate("participant_two")
        .exec();
        const arrayChats = [];
        for await (const chat of chats) {
            const response = await ChatMessage.findOne({chat: chat._id}).sort({
                createdAt:-1,
            });
            arrayChats.push({
                ...chat._doc,
                last_message_date: response?.createdAt || null,
            });
        }
        res.status(200).send(arrayChats);
    } 
   
    catch (error) {
        res.status(400).send({msg: "Error getting chats"})
    }
}

async function deleteChat(req, res) {
    const chat_id = req.params.id;
    try {
      await Chat.findByIdAndDelete(chat_id);
      res.status(200).send({ msg: "Deleted chat" });
    } catch (error) {
      res.status(400).send({ msg: "Error deleting chat" });
    }
}

async function getChat(req, res){
    try {
        const chat_id = req.params.id;
        const chatStorage = await Chat.findById(chat_id)
            .populate("participant_one")
            .populate("participant_two");
        res.status(200).send(chatStorage);
    } catch (error) {
        res.status(400).send({ msg: "Chat not found" });
    }
}



export const ChatController = {
    create,
    getAll,
    deleteChat,
    getChat,
    }