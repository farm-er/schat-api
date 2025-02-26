import { Router } from "express";
import multer from "multer";
import { jsonResponse } from "../utils/json";
import { v4 as uuidv4 } from "uuid";
import { generateJWt } from "../utils/jwt";
import { HttpStatus } from "../utils/status.codes";
import User from "../user/user.model";
import { hash } from "../utils/hash";
import sendVerificationEmail from "../utils/email";
const registerRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
registerRouter.post('/', upload.single('avatar'), registerUser);
async function registerUser(req, res) {
    try {
        // get data from request
        const username = req.body.username;
        const bio = req.body.bio;
        const email = req.body.email;
        const password = req.body.password;
        const avatar = req.file?.buffer;
        // validate data
        if (!bio
            || !password
            || !avatar
            || !username
            || !email) {
            jsonResponse(res, 422, "missing a required field");
            return;
        }
        if (!await validateEmail(email)) {
            jsonResponse(res, 422, "invalid email");
            return;
        }
        if (!await validateUsername(username)) {
            jsonResponse(res, 422, "invalid username");
            return;
        }
        if (!validateAvatar(avatar)) {
            jsonResponse(res, 422, "invalid avatar");
            return;
        }
        // hash password
        const saltRounds = 10;
        const hashedPass = await hash(password, saltRounds);
        const id = uuidv4().toString();
        const user = new User({
            createdAt: new Date(),
            id: id,
            username: username,
            email: email,
            password: hashedPass,
            bio: bio,
            status: "",
            verified: false,
            avatar: avatar
        });
        const result = await User.addUser(user);
        if (!result)
            throw new Error("error inserting user");
        // send a url with the token in it to the user's email
        const token = generateJWt(user.id, false);
        // send email with the token
        sendVerificationEmail(user.email, `http://placeholder.com/verify?token=${token}`);
        jsonResponse(res, HttpStatus.CREATED, "unverified user account created");
    }
    catch (e) {
        console.log("Error in user registration: ", e);
        jsonResponse(res, 500, "error registering the user");
    }
}
export default registerRouter;
async function validateUsername(username) {
    if (username.length > 15)
        return false;
    const user = await User.getUserByUsername(username);
    if (user)
        return false;
    const regex = /^[a-zA-Z]+[_.]{0,1}[a-zA-Z]+$/;
    return regex.test(username);
}
async function validateEmail(email) {
    // check email in the database
    const user = await User.getUserByEmail(email);
    if (user)
        return false;
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // return !(!email.match(regex));
    return regex.test(email);
}
function validateAvatar(avatar) {
    // TODO: check the avatar's size
    return true;
}
