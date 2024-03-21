import { ChatMessage } from "../models/index.js";
import { io , getFilePath} from "../utils/index.js"

async function send(req, res) {
    const { chat_id, message } = req.body;
    const { user_id } = req.user;

    const chat_message = new ChatMessage({
        chat: chat_id,
        user: user_id,
        message,
        type: "TEXT",
    });
    try {
        await chat_message.save();
        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);
        res.status(200).send({});
    } catch (error) {
        res.status(400).send({ msg: "Error: Message not sent " });
    }
}

async function sendImage(req, res) {
    const { chat_id } = req.body;
    const { user_id } = req.user;

    const chat_message = new ChatMessage({
        chat: chat_id,
        user: user_id,
        message: getFilePath(req.files.image),
        type: "IMAGE",
    });
    try {
        await chat_message.save();
        const data = await chat_message.populate("user");
        io.sockets.in(chat_id).emit("message", data);
        io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);
        res.status(200).send({});
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}

async function getAll(req, res) {
    const {chat_id} = req.params;
    try {
        const messages = await ChatMessage.find({chat: chat_id})
        .sort({
            createdAt: 1,
            })
            .populate("user");
            const total = await ChatMessage.find({chat: chat_id}).count();
        res.status(200).send({ messages, total });
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}

async function getTotalMessages(req, res) {
    const {chat_id} = req.params;
    try {
        const response = await ChatMessage.find({chat: chat_id}).count();
        res.status(200).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}

async function GetLastMessage(req,res) {
    const {chat_id} = req.params;
    try {
        const response = await ChatMessage.findOne({chat: chat_id})
        .sort({
            createdAt: -1,
            });
        res.status(200).send( response || {} );
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}
export const ChatMessageController = {
    send,
    sendImage,
    getAll,
    getTotalMessages,
    GetLastMessage,

};