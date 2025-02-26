import { jsonResponse } from "../utils/json";
import { HttpStatus } from "../utils/status.codes";
import { v4 as uuidv4 } from "uuid";
import Chat from "./chat.model";
import { validateReceiverId } from "./chat.utils";
export const getChats = async (req, res) => {
    if (!res.locals.payload) {
        jsonResponse(res, HttpStatus.UNAUTHORIZED, "unauthorized user");
        return;
    }
    try {
        const chats = await Chat.getUserChats(res.locals.payload.id);
        res.status(HttpStatus.OK).json({ chats: chats });
    }
    catch (e) {
        console.log("error getting chats: ", e);
        jsonResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "internal server error");
    }
};
export const addChat = async (req, res) => {
    if (!res.locals.payload) {
        jsonResponse(res, HttpStatus.UNAUTHORIZED, "unauthorized user");
        return;
    }
    const receiverId = req.body.receiver_id;
    if (!await validateReceiverId(receiverId)) {
        jsonResponse(res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid data");
        return;
    }
    const chat = new Chat(uuidv4(), res.locals.payload.id, receiverId);
    try {
        // TODO: check if the chat between the two users already exists
        await chat.checkExistingChat();
        await chat.addChat();
        res.status(HttpStatus.CREATED).json({ chat: chat });
    }
    catch (e) {
        console.log("error adding chat: ", e);
        jsonResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "internal server error");
    }
};
// TODO: deciding how the user will be able to delete chat
export const deleteChat = async (req, res) => {
    res.send("delete chat");
};
