
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
    const media = data.media as string

    if (!chatId || !receiverId || ( !content )) {
        io.to(userId).emit("missing field")
        return
    }
    
    try {

        const chat = await Chat.getChat( chatId) 

        if (!chat) {
            throw new Error("chat not found")            
        }

        if (userId === chat.user1.id.toString()) {
            if (chat.user1.status === userStatus.BLOCKED) {
                io.to(socketId).emit("unauthorized", "blocked");
                return
            }
        }   else if ( chat.user2.id.toString() === userId) {
            if (chat.user2.status === userStatus.BLOCKED) {
                io.to(socketId).emit("unauthorized", "blocked");
                return
            }
        } else {
            throw new Error("receiver not found")
        }

        if (media) {
            // TODO: validate the media
        }


        const message: Message = new Message({
            sentAt: new Date(),
            chatId: chatId,
            id: uuidv4().toString(),
            userId: userId,
            content: content,
            reply: reply,
            media: media,
            seen: false
        })

        await message.addMessage()

        const receiverSock = await getSession( receiverId)

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



