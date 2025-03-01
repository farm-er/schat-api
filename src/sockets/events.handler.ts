import { Server, Socket } from "socket.io";
import { getSession } from "../cache/client";






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




