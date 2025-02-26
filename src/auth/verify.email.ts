import { Request, Response, Router } from "express"
import { generateJWt, verifyEmailVerificationToken } from "../utils/jwt"
import { jsonResponse } from "../utils/json"
import { HttpStatus } from "../utils/status.codes"
import  User from "../user/user.model"

import { JwtPayload } from "jsonwebtoken"





// gets the token from QUERY PARAMS
// verifies it
// verifies the owner in the database
// creates a new token for the verified user


const verifyRouter = Router()

verifyRouter.post('/', verifyEmail)


async function verifyEmail( req: Request, res: Response) {


    try {

        // verify the token
        const token: string = req.query.token as string

        if (!token) {
            jsonResponse(res, HttpStatus.UNPROCESSABLE_ENTITY, "Token is required");
            return;
        }

        const tokenData: JwtPayload = verifyEmailVerificationToken( token)

        // using this because it's an interface
        if (Object.keys(tokenData).length === 0) { jsonResponse( res, HttpStatus.UNAUTHORIZED, "invalid token"); return}

        // verify
        await User.verifyUser( tokenData.id)

        const newToken = generateJWt( tokenData.id, true)

        res.status(HttpStatus.OK).json({ token: newToken})

    } catch (e) {
        console.log( "Error in user verification: ", e)
        jsonResponse( res, HttpStatus.INTERNAL_SERVER_ERROR, "error verifying the user")
    }

}


export default verifyRouter