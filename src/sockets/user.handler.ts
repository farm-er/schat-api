import { Socket } from "socket.io"
import { verifyJWt } from "../utils/jwt"
import User from "../user/user.model"
import { createSession, deleteSession, getSession } from "../cache/client"


// auth using jwt token from socket.handshake.auth

export async function authSocket( socket: Socket): Promise< User | null> {

    console.log("checking token");
    // authentificate the user with jwt

    const token = socket.handshake.auth.token

    if (!token) {
        console.log( "error finding the token")
        return null
    }

    const payload = verifyJWt( token)

    if (!payload || !payload.verified) {
        console.log("unverified user or invalid token")
        return null
    }

    // check the user in the database

    const user: User | null  = await User.getUserById( payload.id)

    if (!user) {
        console.log("user not found")
        return null
    }
    return user
}


export async function connectUser( socketId: string, userId: string) {

    try {
        console.log("checking sessions")
        // maybe check if he already has a session open
        const prvSession = await getSession( userId)

        if (prvSession) {
            await deleteSession( userId)
            console.log("deleted old session")
        }
        console.log("no open session found for this user")

        console.log("creating a session")
        await createSession( userId, socketId)

        console.log("updating user status to online")
        // update the online status
        await User.updateUserStatus( userId, "online")
        
    } catch (e) {
        throw e
    }

} 


export async function disconnectUser( socketId: string, userId: string) {
    try {

        // remove session from cache and update online status
        console.log("disconnected user: ", userId)

        console.log("deleting session")

        await deleteSession( userId)

        console.log("updating user status to: ", Date.now().toString())

        await User.updateUserStatus( userId, Date.now().toString())

    } catch (e) {
        console.log( "error closing connection: ", e)
    }
}


export async function errorUser( socketId: string, userId: string) {
   
    try {

        // remove session from cache and update online status

        console.log("error user: ", userId)
        console.log("socket user: ", socketId)

        console.log("deleting session")

        await deleteSession( userId)

        console.log("updating user status to: ", Date.now().toString())

        await User.updateUserStatus( userId, Date.now().toString())

    } catch (e) {
        console.log( "error closing connection: ", e)
    }
}

