import { Group, User, GroupMessage } from "../models/index.js";
import { getFilePath } from "../utils/image.js";

async function create(req, res) {
    const {user_id} = req.user;
    const group = new Group(req.body);
    group.creator = user_id;
    group.participants = JSON.parse(req.body.participants);
    group.participants = [...group.participants, user_id];
    if(req.files.image) {
        const imagePath = getFilePath(req.files.image);
        group.image = imagePath;
    }

    try {
        const groupStorage = await group.save();
        if(!groupStorage) {
            res.status(400).send({msg: "Error creating group"});
        } else {
            res.status(200).send(groupStorage);
        }
    } catch(error) {
        res.status(500).send({msg: "Server Failed"});
    }
}

async function getAll(req, res) {
    try {
        const { user_id } = req.user ;
        const groups = await Group.find({ participants: user_id })
            .populate("creator")
            .populate("participants")
            .exec();
            const arrayGroup = [];
            for await (const group of groups) {
                const response = await GroupMessage.findOne({group: group._id}).sort({
                    createdAt:-1,
                });
                arrayGroup.push({
                    ...group._doc,
                    last_message_date: response?.createdAt || null,
                });
            }
            res.status(200).send(arrayGroup);
    } catch (error) {
        res.status(500).send({msg: "Error getting groups"});
    }
}

async function getGroup(req, res) {
    const group_id = req.params.id;

    try {
        const groupStorage = await Group.findById(group_id).populate("participants");
        if (!groupStorage) {
            res.status(400).send({ msg: "No se ha encontrado el grupo" });
        } else {
            res.status(200).send(groupStorage);
        }
    } catch (error) {
        res.status(500).send({ msg: "Server error" });
    }
}

async function updateGroup(req,res){
    const {id} = req.params;
    const {name} = req.body;
    const group = await Group.findById(id);

    if (name) group.name = name

    if(req.files.image) {
        const imagePath = getFilePath(req.files.image);
        group.image = imagePath;
    }

    try {
        await Group.findByIdAndUpdate(id, group);
        res.status(200).send({image: group.image, name: group.name});
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Server error" });
    }
}

async function exitGroup(req, res) {
    const {id} = req.params;
    const {user_id} = req.user;

    const group = await Group.findById(id);

    const newParticipants = group.participants.filter(
        (participant) => participant.toString() !== user_id
    );
    const NewData ={
        ...group._doc,
        participants: newParticipants
    }
    try {
        await Group.findByIdAndUpdate(id, NewData);
        res.status(200).send({msg: "You have left the group"});
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Server error" });
    }
}

async function addParticipants(req, res) {
    const {id} = req.params;
    const {users_id} = req.body;

    const group = await Group.findById(id);
    const users = await User.find({_id: users_id});

    const arrayObjectIds = []
    users.forEach((user) => {
        arrayObjectIds.push(user._id)
    });
    const NewData ={
        ...group._doc,
        participants: [...group.participants, ...arrayObjectIds],
    }
    try {
        await Group.findByIdAndUpdate(id, NewData);
        res.status(200).send({msg: "People added successfully"});
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Server error" });
    };
}

async function banParticipant(req, res) {
    const {group_id , user_id} = req.body;

    const group = await Group.findById(group_id);
    
    const newParticipants = group.participants.filter(
        (participant) => participant.toString() !== user_id
    );

    const NewData ={
        ...group._doc,
        participants: newParticipants
    };
    try {
        await Group.findByIdAndUpdate(group_id, NewData);
        res.status(200).send({msg: "User banned successfully"});
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Server error" });
    };
}

async function GetUsersExeptParticipantsGroup(req, res) {
    const {id} = req.params;
    const group = await Group.findById(id);
    
    const participantsString = group.participants.toString();
    const participants = participantsString.split(",");

    const response = await User.find({_id: {$nin: participants}}).select(["-password"])
    try {
        res.status(200).send({response});
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "No users found" });
    };
}

export const GroupController = {
    create,
    getAll,
    getGroup,
    updateGroup,
    exitGroup,
    addParticipants,
    banParticipant,
    GetUsersExeptParticipantsGroup,
}