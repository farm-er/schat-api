import { Server, Socket } from "socket.io";
import { getSession } from "../cache/client";
import Message from "../message/message.model";
import Chat from "../chat/chat.model";






// get the receiver id
// chat id 
export async function handleTyping( socket: Server, userId: string, data: any) {


    try {

        const receiverId = data.receiverId as string
        const chatId = data.chatId as string
        const isTyping = data.isTyping as boolean

        const socketId = await getSession( receiverId)

        // user offline
        if (!socketId) return


        socket.to( socketId).emit( "typing", {
            "typerId": userId,
            "chatId": chatId,
            "isTyping": isTyping
        })

    } catch (e) {
        console.log( "error passing the typing event: ", e)
    }

}


export async function handleRead( socket: Server, userId: string, data: any) {

    try {

        const chatId = data.chatId as string
        const receiverId = data.receiverId as string

        if(!chatId) throw new Error( "missing chatId")

        const chat = await Chat.getChat( chatId)

        if (!chat) throw new Error( "chat not found")
        
        if ( chat.user1.id.toString() !== userId && chat.user2.id.toString() !== userId) throw new Error("user is not part of the chat")
        if ( chat.user1.id.toString() !== receiverId && chat.user2.id.toString() !== receiverId) throw new Error("receiver is not part of the chat")

        // TODO: update it in the db
        await Message.readMessages( chatId)

        // TODO: notify the other user
        const socketId = await getSession( receiverId)

        if (!socketId) return

        socket.to( socketId).emit( "read", {
            "chatId": chatId
        })

    } catch (e) {
        console.log( "error passing the typing event: ", e)
    }

}


