import { json, Router } from "express";
import { generateJWt, verifyJWt } from "../utils/jwt";
import { jsonResponse } from "../utils/json";
import { HttpStatus } from "../utils/status.codes";
import User from "../user/user.model";
const verifyRouter = Router();
verifyRouter.use(json());
verifyRouter.post('/', verifyEmail);
async function verifyEmail(req, res) {
    // verify the token
    const token = req.body.token;
    const tokenData = verifyJWt(token);
    if (Object.keys(tokenData).length === 0) {
        jsonResponse(res, HttpStatus.UNAUTHORIZED, "invalid token");
        return;
    }
    // const user = await getUserById( tokenData.id)
    // make the user verified
    const check = await User.verifyUser(tokenData.id);
    const newToken = generateJWt(tokenData.id, true);
    if (check) {
        res.status(HttpStatus.OK).json({ token: newToken });
        return;
    }
    jsonResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, "error verifying the user");
}
export default verifyRouter;
