import { Request, Response, Router, json } from "express"
import { generateEmailVerificationToken, generateJWt, verifyEmailVerificationToken } from "../utils/jwt"
import { jsonResponse } from "../utils/json"
import { HttpStatus } from "../utils/status.codes"
import  User from "../user/user.model"

import { JwtPayload } from "jsonwebtoken"
import sendVerificationEmail from "../utils/email"
import dotenv from "dotenv";


dotenv.config();


const sendRouter = Router()

sendRouter.post('/', json(), sendEmail)



async function sendEmail( req: Request, res: Response) {


    try {

        const email = req.body.email as string

        if ( !email || !validateEmail( email)) { jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid email");return} 

        const user = await User.getUserByEmail( email)

        if (!user) { jsonResponse( res, HttpStatus.UNAUTHORIZED, "invalid email"); return}
        if (user.verified) { jsonResponse( res, HttpStatus.FORBIDDEN, "user already verified"); return}


        // send a url with the token in it to the user's email
        const token = generateEmailVerificationToken( user.id, false)

        // send email with the token

        await sendVerificationEmail( user.email, `http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/verify?token=${token}`)

        jsonResponse( res, HttpStatus.OK, "verification email sent")

    } catch (e) {
        console.log( "Error in user verification: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error verifying the user")
    }

}

function validateEmail( email: string) : boolean {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(email)
}


export default sendRouter