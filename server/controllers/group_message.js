import { GroupMessage } from "../models/index.js";
import { io , getFilePath} from "../utils/index.js"

async function sendText(req, res) {
    const { group_id, message } = req.body;
    const { user_id } = req.user;

    const group_message = new GroupMessage({
        group: group_id,
        user: user_id,
        message,
        type: "TEXT",
    });
    try {
        await group_message.save();
        const data = await group_message.populate("user");
        io.sockets.in(group_id).emit("message", data);
        io.sockets.in(`${group_id}_notify`).emit("message_notify", data);
        res.status(200).send({});
    } catch (error) {
        res.status(400).send({ msg: "Error: Message not sent " });
    }
}

async function sendImage(req, res) {
    const { group_id } = req.body;
    const { user_id } = req.user;

    const group_message = new GroupMessage({
        chat: group_id,
        user: user_id,
        message: getFilePath(req.files.image),
        type: "IMAGE",
    });
    try {
        await group_message.save();
        const data = await group_message.populate("user");
        io.sockets.in(group_id).emit("message", data);
        io.sockets.in(`${group_id}_notify`).emit("message_notify", data);
        res.status(200).send({});
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}

async function getAll(req, res) {
    const {group_id} = req.params;
    try {
        const messages = await GroupMessage.find({group: group_id})
        .sort({
            createdAt: 1,
            })
            .populate("user");
            const total = await GroupMessage.find({group: group_id}).count();
        res.status(200).send({ messages, total });
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}

async function getTotalMessages(req, res) {
    const {group_id} = req.params;
    try {
        const response = await GroupMessage.find({group: group_id}).count();
        res.status(200).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}

async function GetLastMessage(req,res) {
    const {group_id} = req.params;
    try {
        const response = await GroupMessage.findOne({group: group_id})
        .sort({createdAt: -1 })
        .populate("user");
        res.status(200).send( response || {} );
    } catch (error) {
        res.status(400).send({ msg: "Error: messages not available " });
    }
}


export const GroupMessageController = {
    sendText,
    sendImage,
    getAll,
    getTotalMessages,
    GetLastMessage,

};