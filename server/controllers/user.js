import { User } from "../models/index.js"
import {getFilePath} from "../utils/index.js"

async function getMe(req, res){
    const { user_id } = req.user;
   
   try {
    const response = await User.findById(user_id).select(["-password"]);
    if(!response) {
        res.status(400).send ({msg: "User not found"});
    } else {
        res.status(200).send(response);
    }
   } catch (error) {
    res.status(500).send({msg: "Server error"});
   }
  
    
}

async function getUsers(req, res) {
    try {
        const {user_id} =req.user;
        const users = await User.find({_id: {$ne:user_id}}).select(["-password"]);
        if(!users) {
            res.status(400).send ({msg: "User not found"});
        } else {
            res.status(200).send(users);
        }
       } catch (error) {
        res.status(500).send({msg: "Server error"});
       }
      

}

async function getUser(req, res) {
    try {
        const {id} =req.params;
        const user = await User.findById(id).select(["-password"]);
        if(!user) {
            res.status(400).send ({msg: "User not found"});
        } else {
            res.status(200).send(user);
        }
       } catch (error) {
        res.status(500).send({msg: "Server error"});
       }
      

}

async function updateUser(req,res) {
    const {user_id} = req.user;
    const userData = req.body;
    
    if(req.files.avatar) {
        const imagePath = getFilePath(req.files.avatar);
        
        userData.avatar = imagePath;
    }
    
    try {
        await User.findByIdAndUpdate({ _id: user_id}, userData);
        res.status(200).send(userData);
    } catch(error) {
        console.log(error);
        res.status(400).send({msg: "Actualization error"});
    }
}
export const UserController = {
    getMe,
    getUsers,
    getUser,
    updateUser,
};