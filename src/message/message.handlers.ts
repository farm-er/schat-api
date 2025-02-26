import { Request, Response } from "express";
import { jsonResponse } from "../utils/json";
import { HttpStatus } from "../utils/status.codes";
import Message from "./message.model";





export async function getMessages( req: Request, res: Response) {
    
    const chatId = req.query.chatId as string

    if (!chatId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {

        const messages = await Message.getChatMessages( chatId)
        
        res.status( HttpStatus.OK).json({"messages": messages})

    } catch (e) {
        console.log("error getting messages: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error getting messages")
    }

}





