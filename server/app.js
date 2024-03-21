import express from "express";
import bodyParser from "body-parser"
import cors from "cors";
import http from "http";
import morgan from "morgan";
import { initSocketServer } from "./utils/index.js";
import {authRoutes, userRoutes, chatRoutes, ChatMessageRoutes, groupRoutes, GroupMessageRoutes} from "./routes/index.js";

const app = express();
const server = http.createServer(app);

initSocketServer(server);

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure static folder
app.use(express.static("uploads"));

// configure Header HTTP - CORS
app.use(cors());

// configure logger HTTP - request 
app.use(morgan("dev"));

// Configure routings
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);
app.use("/api", ChatMessageRoutes);
app.use("/api", groupRoutes);
app.use("/api", GroupMessageRoutes);

export { server };