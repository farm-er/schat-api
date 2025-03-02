import { Request, Response } from "express";
import Chat, { userStatus } from "./chat.model";
import { HttpStatus } from "../utils/status.codes";
import { jsonResponse } from "../utils/json";


import { v4 as uuidv4 } from "uuid"
import User from "../user/user.model";



// TODO: get chats all user's chats
// return them as a whole for now
export async function getChats ( req: Request, res: Response) {

    const id = res.locals.payload.id

    if (!id) {
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "something gone wrong"); 
        return;
    }
    
    try {

        const user = await User.getUserById( id);

        if (!user) {
            jsonResponse( res, HttpStatus.UNAUTHORIZED, "invalid user"); 
            return;
        }

        const chats: Chat[] = (
            await Promise.all(user.chats.map( chatId => Chat.getChat(chatId))))
            .filter( (chat): chat is Chat => chat !== null);

        res.status( HttpStatus.OK).json( { "chats": chats})

    } catch (e) {
        console.log( "error getting chat", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error getting chat")
    }
}



// gets the token owner's id 
// and gets the other user from the QUERY PARAMS
// gets the usernames of both
// creates an id for the new chat 
// adds the chat
// and then adds the id of the chat to both users
export async function addChat ( req: Request, res: Response) {
    
    const id1: string = res.locals.payload.id as string
    const id2: string = req.query.userId as string

    if (!id1 || !id2) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    if ( id1 === id2) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "same id"); 
        return;
    }

    try {

        // get both users' usernames 

        const u1 = await User.getUserById( id1)
        const u2 = await User.getUserById( id2)

        if (!u1 || !u2) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "user not found")
            return
        }

        if (!u1.verified || !u2.verified) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "user not verified")
            return
        }



        const chatSet = new Set(u2.chats.map(chat => chat.toString()));

        for (let chatId of u1.chats) {
            if (chatSet.has(chatId.toString())) { 
                jsonResponse(res, HttpStatus.FORBIDDEN, "chat already exists"); 
                return;
            }
        }


        const chatId = uuidv4().toString()

        const chat: Chat = new Chat({
            createdAt: new Date(),
            id: chatId,
            user1: {
                id: id1,
                username: u1.username,
                avatar: u1.avatar,
                status: userStatus.NORMAL,
            },
            user2: {
                id: id2,
                username: u2.username,
                avatar: u2.avatar,
                status: userStatus.NORMAL
            },
            last_message: null,
        })

        // add chat to the chats table
        await chat.addChat()

        // add the chat id to both users
        await User.addChat( id1, chatId)

        await User.addChat( id2, chatId)

        res.status( HttpStatus.CREATED).json({ "chat": chat})

    } catch (e) {
        console.log( "error adding chat", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error adding chat")
    }

}




export async function blockChat( req: Request, res: Response) {

    const userId = res.locals.payload.id
    const chatId = req.body.chatId

    if (!userId || !chatId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {

        const chat = await Chat.getChat( chatId)

        if (!chat) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "not found")
            return
        }

        if(chat.user1.id === userId) {
            await Chat.blockChat( chatId, chat.user2, 2) // update user from position 1
        } else if (chat.user2.id === userId) {
            await Chat.blockChat( chatId, chat.user1, 1) // update user from position 2 
        } else {
            jsonResponse( res, HttpStatus.NOT_FOUND, "not found")
            return
        }


        res.status(HttpStatus.OK).json({"response": "chat user blocked"})
        
    } catch (e) {
        console.log( "error blocking chat", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error blocking chat")
    }

}

export async function muteChat( req: Request, res: Response) {

    const userId = res.locals.payload.id
    const chatId = req.body.chatId

    if (!userId || !chatId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {

        const chat = await Chat.getChat( chatId)

        if (!chat) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "not found")
            return
        }

        if(chat.user1.id === userId) {
            await Chat.muteChat( chatId, chat.user2, 2) // update user from position 1
        } else if (chat.user2.id === userId) {
            await Chat.muteChat( chatId, chat.user1, 1) // update user from position 2 
        } else {
            jsonResponse( res, HttpStatus.NOT_FOUND, "not found")
            return
        }

        res.status(HttpStatus.OK).json({"response": "chat user muted"})
        
    } catch (e) {
        console.log( "error muting chat", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error muting chat")
    }

}


export async function normalChat( req: Request, res: Response) : Promise<void> {

    const userId = res.locals.payload.id
    const chatId = req.body.chatId

    if (!userId || !chatId) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a field"); 
        return;
    }

    try {
        
        const chat = await Chat.getChat( chatId)

        if (!chat) {
            jsonResponse( res, HttpStatus.NOT_FOUND, "not found")
            return
        }

        if(chat.user1.id === userId) {
            await Chat.normalChat( chatId, chat.user2, 2) // update user from position 1
        } else if (chat.user2.id === userId) {
            await Chat.normalChat( chatId, chat.user1, 1) // update user from position 2 
        } else {
            jsonResponse( res, HttpStatus.NOT_FOUND, "not found")
            return
        }

        res.status(HttpStatus.OK).json({"response": "constraint removed from chat user"})

    } catch (e) {
        console.log( "error removing constaints from chat", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error removing constaints from chat")
    }

}

