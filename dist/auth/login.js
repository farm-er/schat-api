import { json, Router } from "express";
import User from "../user/user.model";
import { jsonResponse } from "../utils/json";
import { generateJWt } from "../utils/jwt";
import { HttpStatus } from "../utils/status.codes";
import { compare } from "../utils/hash";
const loginRouter = Router();
loginRouter.use(json());
loginRouter.post('/', loginUser);
async function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    // get user by email 
    const user = await User.getUserByEmail(email);
    if (!user) {
        jsonResponse(res, 401, "invalid credentials");
        return;
    }
    // check password
    const match = await compare(password, user.password);
    if (!match) {
        jsonResponse(res, 401, "invalid credentials");
        return;
    }
    // return a token
    const token = generateJWt(user.id, user.verified);
    res.status(HttpStatus.CREATED).json({ token: token });
}
export default loginRouter;
