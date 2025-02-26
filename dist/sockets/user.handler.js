import { verifyJWt } from "../utils/jwt";
import User from "../user/user.model";
import redisClient from "../cache/client";
export async function authSocket(socket) {
    // authentificate the user with jwt
    const token = socket.handshake.auth.token;
    console.log("got token: ", token);
    if (!token) {
        return;
    }
    console.log("verifying token");
    const payload = verifyJWt(token);
    console.log("got payload: ", payload);
    if (!payload /*|| !payload.verified*/) {
        return;
    }
    // check the user in the database
    const user = await User.getUserById(payload.id);
    if (!user) {
        return;
    }
    return user;
}
export async function connectUser(socket, user) {
    try {
        // maybe check if he already has a session open
        const prvSession = await redisClient.get(user.id);
        if (prvSession)
            throw new Error("user already has a session");
        // update the online status
        await User.updateUserStatus(user.id, "online");
        const updUser = await User.getUserById(user.id);
        console.log(updUser?.status);
        await redisClient.set(user.id, socket.id);
    }
    catch (e) {
        throw e;
    }
}
export async function disconnectUser(userId) {
    try {
        // TODO: remove session from cache and update online status
        await redisClient.del(userId);
        await User.updateUserStatus(userId, Date.now().toString());
        const user = await User.getUserById(userId);
        if (!user)
            return;
        const status = new Date(Number(user?.status));
        console.log(status);
        console.log(`user ${userId} disconnected`);
    }
    catch (e) {
        console.log("error closing connection: ", e);
    }
}
export function closeUser(userId) {
    return () => {
        console.log(`user ${userId} closed connection`);
    };
}
export function errorUser(userId) {
    return () => {
        console.log(`error in user ${userId} connection`);
    };
}
