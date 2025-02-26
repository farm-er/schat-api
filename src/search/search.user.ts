


import { Request, Response, Router } from "express"
import { jwtMiddleware } from "../middlewares/jwt.middleware"
import { HttpStatus } from "../utils/status.codes"
import { jsonResponse } from "../utils/json"
import mediaStorage from "../media_storage/media_storage"

import imageType from 'image-type'
import User from "../user/user.model"




const searchUserRouter = Router()

// verify user requesting the avatar
searchUserRouter.use( jwtMiddleware)

searchUserRouter.get('/', searchUsers)



async function searchUsers( req: Request, res: Response) {

    const username = req.query.username as string


    if (!username) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid user"); 
        return;
    }


    try {

        const users = await User.searchUserByUsername( username)

        if (!users) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "no user found")
            return
        }

        
        res.status( HttpStatus.OK).json( { users: users})
        
    } catch (e) {
        console.log( "error getting avatar", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error getting avatar")
    }



} 


export default searchUserRouter