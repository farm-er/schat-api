import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
export function generateJWt(id, verified) {
    var privateKey = readFileSync('private.key');
    const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // +1h
        id: id,
        verified: verified
    }, privateKey, { algorithm: 'RS512' });
    return token;
}
// a token verification function 
export function verifyJWt(token) {
    const cert = readFileSync('public.pem');
    const tokenData = jwt.verify(token, cert);
    return tokenData;
}
