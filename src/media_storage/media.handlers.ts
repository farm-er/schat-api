import { Request, Response, Router } from "express";
import { jwtMiddleware } from "../middlewares/jwt.middleware";
import { jsonResponse } from "../utils/json";
import { HttpStatus } from "../utils/status.codes";
import mediaStorage from "./media_storage";

import imageType from 'image-type'
import multer from "multer";
import Chat from "../chat/chat.model";



const mediaRouter = Router()


mediaRouter.use( jwtMiddleware)


mediaRouter.get( "/images/", getImage)


async function getImage( req: Request, res: Response) {

    const imageId = req.query.imageId as string

    const chatId = req.query.chatId as string

    const userId = res.locals.payload.id as string


    if (!imageId || !userId || !chatId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {

        // check if the user is in the chat
        const chat = await Chat.getChat( chatId)

        if (!chat) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "chat not found"); 
            return;
        }

        if ( chat.user1.id.toString() !== userId && chat.user2.id.toString() !== userId) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "chat not found"); 
            return;
        }
        
        const url = await mediaStorage.getImage( chatId + "/" + imageId)

        res.status(HttpStatus.OK).json({
            "url": url
        })
    } catch (e) {
        console.log( "error getting image url: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "internal server error")
    }

}


// WE DON'T NEED THIS HANDLER FOR NOW

const storage = multer.memoryStorage();
const upload = multer({ storage });

mediaRouter.post( "/images/", upload.single('media'), storeImage)

async function storeImage( req: Request, res: Response) {

    const userId = res.locals.payload.id as string

    const chatId = req.query.chatId as string
    const image = req.file?.buffer

    if ( !userId || !image || !chatId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {

        const chat = await Chat.getChat( chatId)

        if (!chat) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "chat not found"); 
            return;
        }

        if ( chat.user1.id.toString() !== userId && chat.user2.id.toString() !== userId) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "chat not found"); 
            return;
        }

        const type = await imageType( image)

        if (!type) {
            jsonResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "Unable to determine image type");
            return;
        }

        // TODO: maybe some type validation here
    
        const imageId = await mediaStorage.storeImage( chatId, image)

        res.status(HttpStatus.OK).json({
            "id": imageId
        })
        
    } catch (e) {
        console.log( "error uploading image: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "internal server error")
    }

}




export default mediaRouter