import { Router } from "express";
import { jwtMiddleware } from "../middlewares/jwt.middleware";
import { getMessages } from "./message.handlers";


const messageRouter = Router()


// authentification with jwt token 
messageRouter.use( jwtMiddleware)


// returns the token owner's chats 
messageRouter.get( '/', getMessages)


export default messageRouter








