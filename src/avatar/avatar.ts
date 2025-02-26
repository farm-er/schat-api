import { Request, Response, Router } from "express"
import { jwtMiddleware } from "../middlewares/jwt.middleware"
import { HttpStatus } from "../utils/status.codes"
import { jsonResponse } from "../utils/json"
import mediaStorage from "../media_storage/media_storage"

import imageType from 'image-type'




const avatarRouter = Router()

// verify user requesting the avatar
avatarRouter.use( jwtMiddleware)

avatarRouter.get('/', getAvatar)



// this function takes the id of the user from the token payload
// get the owner of the avatar id
// gets the corresponding avatar
// returns error if not found
// retruns the avatar if found

async function getAvatar( req: Request, res: Response) {

    const id = req.query.id as string


    if (!id) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid user"); 
        return;
    }


    try {

        // TODO: check if the user exists first

        const avatar = await mediaStorage.getAvatar( id)

        if (!avatar) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "avatar not found")
            return
        }

        const type = await imageType( avatar)

        if (!type) {
            jsonResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "Unable to determine image type");
            return;
        }

        res.contentType(type.mime);
        
        res.status( HttpStatus.OK).send( avatar)
        
    } catch (e) {
        console.log( "error getting avatar", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error getting avatar")
    }



} 


export default avatarRouter