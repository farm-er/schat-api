import { NextFunction, Request, Response } from "express"
import { jsonResponse } from "../utils/json"
import { HttpStatus } from "../utils/status.codes"
import { verifyJWt } from "../utils/jwt"
import { JwtPayload } from "jsonwebtoken"



// check headers for Bearer
// TODO: check for Bearer because we're not really checking
// gets the token 
// verifies it
// if the user is authentificated the payload is stored
// in res.locals fro the handlers to consume
export async function jwtMiddleware (req: Request, res: Response, next: NextFunction) {


    const authHead : string[] | undefined = req.headers["authorization"]?.split( " ")

    if ( authHead === undefined || authHead.length != 2) {jsonResponse( res, HttpStatus.UNAUTHORIZED, "unauthorized user"); return}

    const token: string = authHead[1]

    try {
        const payload: JwtPayload =  verifyJWt( token);

        if (!payload.verified) {
            jsonResponse( res, HttpStatus.UNAUTHORIZED, "unauthorized user")
            return
        }
        res.locals.payload = payload
    } catch(e) {
        console.log("unverified user", e)
        jsonResponse( res, HttpStatus.UNAUTHORIZED, "unauthorized user")
        return
    }

    next()
}