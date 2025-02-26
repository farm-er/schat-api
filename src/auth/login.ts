import { json, Request, Response, Router } from "express";
import User from "../user/user.model";
import { jsonResponse } from "../utils/json";
import { generateJWt } from "../utils/jwt";
import { HttpStatus } from "../utils/status.codes";
import { compare } from "../utils/hash";



const loginRouter = Router()

loginRouter.use(json())

loginRouter.post('/', loginUser)


async function loginUser( req: Request, res: Response) {

    const email: string = req.body.email
    const password: string = req.body.password

    // check if the fields exists

    if ( !password ||  !email ) {
        jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "missing a required field")
        return
    }

    if ( !validateEmail( email)) { jsonResponse( res, HttpStatus.UNPROCESSABLE_ENTITY, "invalid email");return} 

    // get user by email 

    const user = await User.getUserByEmail( email);

    if (!user) { jsonResponse( res, HttpStatus.UNAUTHORIZED, "invalid credentials"); return}
    if (!user.verified) { jsonResponse( res, HttpStatus.UNAUTHORIZED, "unverified user"); return}

    // check password

    const match = await compare(password, user.password)

    if (!match) { jsonResponse( res, HttpStatus.UNAUTHORIZED, "invalid credentials"); return}

    // return a token
    const token = generateJWt( user.id, user.verified)    

    res.status(HttpStatus.OK).json({ token: token})

}


export default loginRouter


function validateEmail( email: string) : boolean {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(email)
}


