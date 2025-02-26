
import { v4 as uuidv4 } from "uuid"

import { createSession, deleteSession, getSession } from "../cache/client"


// needs the socket id
// get the user id
// get the destination id which will be the chat id
//  

import Message, { Media, Reply } from "../message/message.model"
import Chat from "../chat/chat.model"
import { Server } from "socket.io"


// needs chat id, receiver id, content
// checks the chat
// checks if the chat is with the receiver
// stores the message  
export async function handleMessage( io: Server, socketId: string, userId: string, data: any) {

    const chatId = data.chatId as string
    const receiverId = data.receiverId as string
    const content = data.content as string
    const reply = data.reply as Reply

    if (!chatId || !receiverId || ( !content )) {
        io.to(userId).emit("missing field")
        return
    }
    
    try {

        const chat = await Chat.getChat( chatId) 

        if (!chat) {
            throw new Error("chat not found")            
        }

        if ( chat.user1.id.toString() !== receiverId && chat.user2.id.toString() !== receiverId) {
            throw new Error("receiver not found")
        }

        const message: Message = new Message({
            sentAt: new Date(),
            chatId: chatId,
            id: uuidv4().toString(),
            userId: userId,
            content: content,
            reply: reply,
        })

        await message.addMessage()

        const receiverSock = await getSession( receiverId)

        if (!receiverSock) return

        console.log( "sending: ", message)
        io.to(receiverSock).emit("message", { message: message});
        // sending the message back to the user
        // sending only the required data
        console.log("callback: ", message.id, message.sentAt)
        io.to(userId).emit("messageCallBack", { 
            "id": message.id,
            "sentAt": message.sentAt
        });

        // TODO: update the last message of the chat

    } catch (e) {
        console.log( "error storing the message: ", e)
        io.to(userId).emit( "error")
    }



} 



