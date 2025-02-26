import { jsonResponse } from "../utils/json";
import { HttpStatus } from "../utils/status.codes";
import { verifyJWt } from "../utils/jwt";
export async function jwtMiddleware(req, res, next) {
    const authHead = req.headers["authorization"]?.split(" ");
    if (authHead === undefined || authHead.length != 2) {
        jsonResponse(res, HttpStatus.UNAUTHORIZED, "unauthorized user");
        return;
    }
    const token = authHead[1];
    try {
        res.locals.payload = verifyJWt(token);
    }
    catch (e) {
        console.log("unverified user", e);
        jsonResponse(res, HttpStatus.UNAUTHORIZED, "unauthorized user");
        return;
    }
    next();
}
