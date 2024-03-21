import express from "express";
import multiparty from "connect-multiparty";
import {UserController, GroupController} from "../controllers/index.js"
import {mdAuth} from "../middlewares/index.js"

const mdupload=multiparty({uploadDir:"./uploads/avatar"})

const api = express.Router();

api.get("/user/me",[mdAuth.asureAuth], UserController.getMe);
api.patch("/user/me",[mdAuth.asureAuth, mdupload], UserController.updateUser);
api.get("/user",[mdAuth.asureAuth], UserController.getUsers);
api.get("/user/:id",[mdAuth.asureAuth], UserController.getUser);
api.get("/users_exept_participants_group/:id", [mdAuth.asureAuth], GroupController.GetUsersExeptParticipantsGroup)

export const userRoutes = api;