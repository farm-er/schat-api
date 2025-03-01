
import { v4 as uuidv4 } from "uuid"

import { createSession, deleteSession, getSession } from "../cache/client"


// needs the socket id
// get the user id
// get the destination id which will be the chat id
//  

import Message, { Reply } from "../message/message.model"
import Chat, { userStatus } from "../chat/chat.model"
import { Server } from "socket.io"


// needs chat id, receiver id, content
// checks the chat
// checks if the chat is with the receiver
// stores the message  
export async function handleMessage( io: Server, socketId: string, userId: string, data: any) {

    const chatId = data.chatId as string
    const receiverId = data.receiverId as string
    const content = data.content as string
    const reply = data.reply as Reply | null
    const media = data.media as string | null

    if (!chatId || !receiverId || ( !content )) {
        io.to(userId).emit("missing field")
        return
    }
    
    try {

        const chat = await Chat.getChat( chatId) 

        if (!chat) {
            throw new Error("chat not found")            
        }

        // check chat sender and receiver and respective status
        if ( chat.user1.id.toString() !== userId && chat.user2.id.toString() !== receiverId) {
            // if the user is blocked
            if (chat.user1.status === userStatus.BLOCKED) {
                io.to(userId).emit("unauthorized", "you're blocked by the user");
            }
        } else if ( chat.user2.id.toString() !== userId && chat.user1.id.toString() !== receiverId) {
            if (chat.user2.status === userStatus.BLOCKED) {

            }
        } else {
            throw new Error("receiver not found")
        }

        const message: Message = new Message({
            sentAt: new Date(),
            chatId: chatId,
            id: uuidv4().toString(),
            userId: userId,
            content: content,
            reply: reply,
            media: media
        })

        await message.addMessage()

        const receiverSock = await getSession( receiverId)

        // TODO: update the message only when the receiver is offline
        // TODO: but we need to update when one of the users logout 
        // TODO: until then we will just update it every time
        
        // if (!receiverSock){
        //     // update the last message of chats
        //     await Chat.updateLastMessage( {
        //         sentAt: message.sentAt,
        //         id: message.id,
        //         userId: message.userId,
        //         content: message.content,
        //         reply: message.reply,
        //         media: media
        //     }, chatId)
        //     return
        // } 

        console.log( "sending: ", message)
        io.to(receiverSock).emit("message", { message: message});
        // sending the message back to the user
        // sending only the required data
        console.log("callback: ", message.id, message.sentAt)
        io.to(socketId).emit("messageCallBack", { 
            "id": message.id,
            "sentAt": message.sentAt
        });

        await Chat.updateLastMessage( {
            sentAt: message.sentAt,
            id: message.id,
            userId: message.userId,
            content: message.content,
            reply: message.reply,
            media: media
        }, chatId)

    } catch (e) {
        console.log( "error storing the message: ", e)
        io.to(userId).emit( "server error", "error handling user")
    }



} 



