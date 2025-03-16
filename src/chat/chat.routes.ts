import { json, Router } from "express";
import { addChat, blockChat, getChats, muteChat, normalChat } from "./chat.handlers";
import { jwtMiddleware } from "../middlewares/jwt.middleware";


const chatRouter = Router()


// authentification with jwt token 
chatRouter.use( jwtMiddleware)


// returns the token owner's chats 
chatRouter.get( '/', getChats)


// creates a chat for the token owner
// needs the other user id in QUERY PARAMS
// as "userId"
// returns the added chat
chatRouter.post( '/', addChat)


// ROUTE BLOCKING AND MUTING ANOTHER USERS
chatRouter.post( '/block', json(), blockChat)
chatRouter.post( '/mute', json(),muteChat)
chatRouter.post( '/normal', json(),normalChat)


export default chatRouter








