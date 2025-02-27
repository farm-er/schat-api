import { json, Router } from "express";

import { jwtMiddleware } from "../middlewares/jwt.middleware";
import { deleteUser, getStatus, getUser, updateAvatar, updateUsername } from "./user.handlers";
import multer from "multer";





const userRouter = Router()

userRouter.use( jwtMiddleware)


userRouter.get("/", getUser)

userRouter.delete("/", json(), deleteUser)

userRouter.post("/avatar/",  updateAvatar)
userRouter.post("/username/", updateUsername)
userRouter.get("/status/", getStatus)


export default userRouter