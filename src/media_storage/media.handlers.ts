import { Request, Response, Router } from "express";
import { jwtMiddleware } from "../middlewares/jwt.middleware";
import { jsonResponse } from "../utils/json";
import { HttpStatus } from "../utils/status.codes";
import mediaStorage from "./media_storage";

import imageType from 'image-type'



const mediaRouter = Router()


mediaRouter.use( jwtMiddleware)


mediaRouter.get( "/images/", getImage)


async function getImage( req: Request, res: Response) {

    const imageId = req.query.imageId as string

    const userId = res.locals.payload.id as string


    if (!imageId || !userId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {
        
        const url = await mediaStorage.getImage( imageId)

        res.status(HttpStatus.OK).json({
            "url": url
        })
    } catch (e) {
        console.log( "error getting image url: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "internal server error")
    }

}


// WE DON'T NEED THIS HANDLER FOR NOW

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// mediaRouter.post( "/images/", upload.single('avatar'), storeImage)

async function storeImage( req: Request, res: Response) {

    const userId = res.locals.payload.userId as string
    const image = req.file?.buffer

    if ( !userId || !image) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {

        const type = await imageType( image)

        if (!type) {
            jsonResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "Unable to determine image type");
            return;
        }

        // TODO: maybe some type validation here
    
        const imageId = await mediaStorage.storeImage( userId, image, type.ext)

        
    } catch (e) {
        console.log( "error uploading image: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "internal server error")
    }

}




export default mediaRouter