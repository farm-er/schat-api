import { Request, Response, Router } from "express";
import multer from "multer";
import { jsonResponse } from "../utils/json"

import { v4 as uuidv4 } from "uuid"
import { generateEmailVerificationToken } from "../utils/jwt";
import { HttpStatus } from "../utils/status.codes";
import User from "../user/user.model";
import { hash } from "../utils/hash";
import sendVerificationEmail from "../utils/email";

import sharp from 'sharp';
import dotenv from "dotenv";


dotenv.config();

const maxAvatarSize: number = 500000;
const maxAvatarDim: number = 500;

const registerRouter = Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });

registerRouter.post('/', upload.single('avatar'), registerUser)


async function registerUser( req: Request, res: Response) {

    try {
        // get data from request
        const username: string = req.body.username
        const bio: string = req.body.bio
        const email: string = req.body.email 
        const password: string = req.body.password
        const avatar: Buffer | null = req.file?.buffer ?? null

        // validate data
        if (
            !bio
        ||  !password
        ||  !username
        ||  !email
        ) {
            jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a required field")
            return
        }

        if ( ! await validateEmail( email)) { jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid email");return}

        if ( ! await validateUsername( username)) { jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid username");return}

        if ( avatar && ! await validateAvatar( avatar)) { jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid avatar");return}   
        
        if ( !validateBio( bio)) { jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid bio");return}                
        
        // hash password
        const saltRounds: number = 10
        const hashedPass : string = await hash( password, saltRounds)

        const id = uuidv4().toString()

        const user: User = new User({
            createdAt: new Date(),
            id: id,
            username: username,
            email: email,
            password: hashedPass,
            bio: bio,
            status: "",
            verified: false,
            avatar: "",
            chats: null
        })
        console.log( "this is the avatar before uploading: ", avatar?.length)

        await User.addUser( user, avatar);

        // TODO: need to make the token only available for like 10 minutes 

        // send a url with the token in it to the user's email
        const token = generateEmailVerificationToken( user.id, false)

        // send email with the token

        await sendVerificationEmail( user.email, `http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/verify?token=${token}`)
    
        jsonResponse( res, HttpStatus.CREATED, "unverified user account created")

    } catch(e) {
        console.log( "Error in user registration: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error registering the user")
    }
}

export default registerRouter



export async function validateUsername( username: string): Promise<boolean> {
    if (username.length > 15) return false;
    const user = await User.getUserByUsername( username);
    if (user) return false
    const regex = /^[a-zA-Z]+[_.]{0,1}[a-zA-Z]+$/
    return regex.test(username) 
}


async function validateEmail( email: string) : Promise<boolean> {
    // check email in the database
    const user = await User.getUserByEmail( email);
    if (user) return false
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    // return !(!email.match(regex));
    return regex.test(email)
}


export async function validateAvatar( avatar: Buffer) : Promise<boolean> {
    // TODO: check the avatar's size
    const image = sharp(avatar)

    const metadata = await image.metadata()

    const { width, height, size} = metadata

    if (!height) return false
    if (!width) return false
    if (!size) return false

    if ( size > maxAvatarSize) return false

    if ( height !== width) return false

    if ( height > maxAvatarDim) return false

    return true;
}


function validateBio( bio: string) : boolean {
    // TODO: check bio's length
    if (bio.length > 255) return false
    return true
}

