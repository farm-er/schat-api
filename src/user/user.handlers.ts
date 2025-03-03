import { Request, Response } from "express";
import { HttpStatus } from "../utils/status.codes";
import { jsonResponse } from "../utils/json";
import User from "./user.model";
import { compare } from "../utils/hash";
import mediaStorage from "../media_storage/media_storage";
import { validateAvatar, validateUsername } from "../auth/register";




export async function getUser (req: Request, res: Response): Promise<void> {
    
    const id = res.locals.payload.id 
    
    if (!id) {
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "something gone wrong"); 
        return;
    }

    try {

        const user = await User.getUserById( id);

        if (!user) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "user not found")
            return
        }

        // TODO: to not send password etc...
        const u = {
            createAt: user.createdAt,
            id: user.id,
            username: user.username,
            bio: user.bio,
            email: user.email,
            status: user.status,
            verified: user.verified,
            avatar: user.avatar
        }

        res.status( HttpStatus.OK).json( { "user": u})

    } catch (e) {

        console.log( "error getting user",e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error getting user")
    }
}

export async function deleteUser ( req: Request, res: Response): Promise<void> {

    const id = res.locals.payload.id 
    const pass = req.body.password

    if (!id || !pass) {
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "something gone wrong"); 
        return;
    }

    try {

        const user = await User.getUserById( id)

        if (!user) throw new Error("user not found")

        if (await compare( pass, user.password)) {
            // delete the profile if the password is correct
            await User.deleteUser( id)
        }

        res.status(HttpStatus.OK).json( {"response": "profile deleted successfully"})
        
    } catch (e) {
        console.log( "error removing user profile",e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error removing user profile")
    }
}


export async function updateUsername ( req: Request, res: Response): Promise<void> {

    const userId = res.locals.payload.id as string
    const username = req.body.username

    if (!userId || !username) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing field"); 
        return;
    }

    if (!await validateUsername( username) ) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid username");
        return
    }

    try {

        await User.updateUsername( userId, username)

        res.status( HttpStatus.OK).json( {"response": "username updated successfully"})
        
    } catch (e) {
        console.log( "error updating username",e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error updating username")
    }

}


export async function updateAvatar( req: Request, res: Response): Promise<void> {

    const userId = res.locals.payload.id as string

    if (!userId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing field"); 
        return;
    }

    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.startsWith("image/")) {
        jsonResponse(res, HttpStatus.BAD_REQUEST, "Invalid file type");
        return;
    }

    try {

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk)); 
        req.on("end", async () => {
            const avatar = Buffer.concat(chunks); 

            if ( avatar && ! await validateAvatar( avatar)) { 
                jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid avatar");
                return
            }

            await mediaStorage.updateAvatar( avatar, userId, contentType.split( '/')[1].toLowerCase());

            jsonResponse(res, HttpStatus.OK, "avatar updated successfully");
        });

    } catch (e) {
        console.log( "error updating user's avatar",e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error updating user's avatar")
    }

}


export async function getStatus( req: Request, res: Response): Promise<void> {

    const userId = req.query.userId as string

    if (!userId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing field"); 
        return;
    }


    try {

        const status = await User.getUserStatus( userId)

        res.status( HttpStatus.OK).json({
            "status": status
        })
        
    } catch (e) {
        console.log( "error getting user's status",e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error getting user's status")
    }

}
