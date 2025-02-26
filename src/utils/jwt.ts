
import { readFileSync } from "fs";
import jwt from "jsonwebtoken"


export function generateJWt( id: string, verified: boolean) : string {

    var privateKey = readFileSync('private.key');

    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // +1h
        id: id,
        verified: verified
    }, privateKey, { algorithm: 'RS512'});

    return token

} 


// a token verification function 
export function verifyJWt( token: string) : jwt.JwtPayload {
    const cert = readFileSync('public.pem'); 
    const tokenData = jwt.verify(token, cert);
    return tokenData as jwt.JwtPayload;
}


// TODO: make specific rules for verification tokens
export function generateEmailVerificationToken( id: string, verified: boolean) : string {

    var privateKey = readFileSync('private.key');

    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 10),
        id: id,
        verified: verified
    }, privateKey, { algorithm: 'RS512'});

    return token

} 

// TODO: make specific rules for verification tokens
export function verifyEmailVerificationToken( token: string) : jwt.JwtPayload {
    const cert = readFileSync('public.pem'); 
    const tokenData = jwt.verify(token, cert);
    return tokenData as jwt.JwtPayload;
}