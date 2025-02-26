import express from "express";
import userRouter from "./user/user.routes";
import cors from "cors";
import dotenv from "dotenv";
import loginRouter from "./auth/login";
import registerRouter from "./auth/register";
import verifyRouter from "./auth/verify.email";
import chatRouter from "./chat/chat.routes";
import { Server } from "socket.io";
import * as http from "http";
import path from "path";
import { authSocket, closeUser, connectUser, disconnectUser, errorUser } from "./sockets/user.handler";
import { handleMessage } from "./sockets/message.handler";
dotenv.config();
const port = process.env.PORT;
export const app = express();
app.use(cors());
app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/register', registerRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/chats', chatRouter);
app.get('/', (req, res) => {
    res.type('html');
    res.sendFile(path.join(__dirname, "/src/socket.html"), () => { console.log("file sent"); });
});
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
io.on("connection", async (socket) => {
    try {
        const user = await authSocket(socket);
        if (!user) {
            socket.emit("unauthorized", "invalid token");
            socket.disconnect();
            return;
        }
        // store the user's id and socket id in cache
        await connectUser(socket, user);
        // implement callbacks for the socket
        socket.on("message", handleMessage);
        socket.on('disconnect', async () => {
            await disconnectUser(user.id);
        });
        socket.on('close', closeUser(user.id));
        socket.on('error', errorUser(user.id));
    }
    catch (e) {
        console.log("error adding new connection with error: ", e);
        socket.emit("message", "internal server error");
        socket.disconnect();
        return;
    }
});
server.listen(port, () => {
    console.log(`running on port: ${port}`);
});
