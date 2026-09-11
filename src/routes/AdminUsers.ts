import express from "express"

import { verifyAdminMiddleware } from "../middlewere/AdminMiddlewere";
import { getUser, getUsers, ToggleStatus } from "../controllers/adminUserController";

const routes  = express.Router();

routes.get("/getall",verifyAdminMiddleware,getUsers)
routes.get("/get/:id",verifyAdminMiddleware,getUser)
routes.patch("/status/:id",verifyAdminMiddleware,ToggleStatus)


export default routes