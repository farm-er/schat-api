import { Router } from "express";
import * as handlers from "./user.handlers";
/*

    ADD JWT MIDDLEWARE FOR THE THIS ROUTER

*/
const userRouter = Router();
userRouter.get("/", handlers.getUser);
userRouter.post("/", handlers.addUser);
userRouter.put("/", handlers.updateUser);
userRouter.delete("/", handlers.deleteUser);
export default userRouter;
