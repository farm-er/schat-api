
import express, { Express, json, Request, Response} from "express";
import userRouter from "./user/user.routes";
import cors from "cors"
import dotenv from "dotenv";
import loginRouter from "./auth/login";
import registerRouter from "./auth/register";
import verifyRouter from "./auth/verify.email";
import chatRouter from "./chat/chat.routes";


import { Server, Socket } from "socket.io"
import * as http from "http"
import path from "path";
import User, { createUserTable } from "./user/user.model";
import { authSocket, connectUser, disconnectUser, errorUser } from "./sockets/user.handler";
import { handleMessage } from "./sockets/message.handler";
import dbClient, { createKeyspace } from "./database/client";
import { createChatTable } from "./chat/chat.model";
import { createMessageTable } from "./message/message.model";
import { createAvatarTable } from "./media_storage/media_storage";
import messageRouter from "./message/message.routes";
import searchUserRouter from "./search/search.user";
import sendRouter from "./auth/send.verificationCode";
import { handleTyping } from "./sockets/events.handler";
import { connectToRedis } from "./cache/client";
import mediaRouter from "./media_storage/media.handlers";
import { createStorageBuckets, minioClient } from "./media_storage/client";


dotenv.config();

const port = process.env.PORT;

export const app: Express = express()


app.use(cors())


//GET
// gets an id from 
// authentification with jwt token
// gets user by id from the token
// retruns user with 200
// returns 500 on error
// returns 401 for invalid token 
// DELETE
// deletes user's profile
// needs user's token and password from request body
// returns 422 if an argument is missing
// returns 200 with response profile deleted successfully on success
// POST /api/users/avatar/ SET CONTENT TYPE
// needs user token
// gets raw binary of an avatar with content-type header
// returns 400 for wrong content-type
// 422 for missing fields or invalid data
// POST /api/users/username/
// returns 422 for missing fields or invalid data 
// GET /api/users/status
// needs token
// needs userId in query params
// returns user latest status
app.use( '/api/users', userRouter)

// POST
// gets email and password from json body
// retruns 422 if a field is missing or the email is invalid
// retruns 401 for invalid credentials
// retruns 200 with a token
app.use( '/api/login', loginRouter)
// POST
// gets username, bio, email, password, avatar from form data
// returns 422 if a field is missing or invalid
app.use( '/api/register', registerRouter)
// POST
// gets token from query parameters
// returns 422 if token is missing
// returns 401 if the token is invalid
// retruns a new token for normal use with ok status 
app.use( '/api/verify', verifyRouter)
// POST
// needs email in the body
// returns 401 if the email doesn't exist
// returns 403 if the email is already verified
// returns 200 and the email is sent to the user
app.use( '/api/send/email', sendRouter)
// GET
// gets id from token
// returns 401 if the token is invalid or owner not found
// returns user's chats with 200 status
// POST
// gets id from token 
// and gets the other user id from query params
// returns 422 if one of them is missing
// returns chat with 200 status
// POST /api/chats/block or /api/chats/mute or /api/chats/normal
// to block mute (unmute/unblock) user respectively
// needs auth token and chatId from the request body
app.use( '/api/chats', chatRouter)
// GET
// needs user's token
// gets chatId from query parameter
// returns 422 if missing
// returns messages of the chat with 200
// or internal server error 500 if a problem occurs
app.use( '/api/messages', messageRouter)


// GET
// need jwt token
// gets username from query as USERNAME
// returns all users with usernames prefixed by the username in the query
app.use('/api/search/users', searchUserRouter)

// this route is specific to media downloading
// GET /images/ with imageId in query params and user token
//      on success returns download url valid for 1h
app.use('/api/download/', mediaRouter)


const server = http.createServer( app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PUT"],
    },
});


// this is for socket handling
// on connection it takes the token from SOCKET.HANDSHAKE.AUTH.TOKEN
// disconnects if the token is invalid and sends  "unauthorized", "invalid token" message
// then connnect the user by
// checks if the user already has a connection 
// if not create a session and store it in the cache
// update user's status to online
// then add corresponding handler for every event
io.on( "connection", async (socket: Socket) => {

    try {
        const user: User | null = await authSocket( socket)

        if (!user) {
            socket.emit( "unauthorized", "invalid token")
            socket.disconnect()
            return
        }
        // store the user's id and socket id in cache
        await connectUser( socket.id, user.id)

        // EVENTS THAN CAN COME FROM THE USER

        // MESSAGE event
        // gets a json object
        // containing chatId, receiverId, message content, reply, media
        // interface Reply {
        //     id: string
        //     content: string
        // }
        
        // interface Media {
        //     id: string
        //     type: string
        // }
        // returns nothing for now
        // sends the message to the receiver if he's online as the same event MESSAGE   
        // and returns missing data to the sender
        // returns unauthorized event if the user is blocked 
        // or server error in case of a server error
        socket.on( "message", async (data) => {
            await handleMessage( io, socket.id, user.id, data);
        })

        // TYPING event
        // gets json object
        // containing receiverId(the one that should get the typing event)
        // chatId the chat where the typing occurs ( we get the chat id to make it easier for the client side and for potential implementation of groups)
        // then sends these informations to the receiverId as follows
        //{
        //     "typerId": typerId,
        //     "chatId": chatId,
        //     "isTyping": true / false
        // }
        socket.on( "typing", async (data) => {
            await handleTyping( io, user.id, data)
        })

        // TODO: other events here

        socket.on('disconnect',  async () => {
            await disconnectUser( socket.id, user.id)
        });

        socket.on( 'error', async () => {
            await errorUser( socket.id, user.id)
        })

    } catch (e) {
        console.log("error adding new connection with error: ", e)
        socket.emit( "message", "internal server error")
        socket.disconnect()
    }

})


try {

    // connecting redis client
    await connectToRedis()

    // creating keyspace in cassandra
    await createKeyspace()

    // create users table and user type
    await createUserTable( dbClient)

    // create messages table
    await createMessageTable( dbClient)

    // create chat table
    await createChatTable( dbClient)

    // create avatars table
    await createAvatarTable( dbClient)

    // test minio client
    minioClient.listBuckets().then(console.log).catch(console.error);

    await createStorageBuckets()
    
} catch (e) {
    console.log( "error initializing database: ", e)
    process.exit(1)
}



if (process.env.NODE_ENV !== "test") {
    server.listen( port, () => {
        console.log(`running on port: ${port}`)
    })
}

