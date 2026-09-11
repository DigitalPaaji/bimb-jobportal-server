import express from  "express";
import { GetUser, loginByGoogle, loginUser, logoutUser, SignupUser, updateUser, verifyUser } from "../controllers/userController";
import { UserMiddlewere } from "../middlewere/UserMiddlewere";
import { UploadUser } from "../helper/Uploaduser";


const routes  = express.Router();

routes.post("/signup",SignupUser)
routes.post("/verify",verifyUser)
routes.post("/login",loginUser)
routes.post("/login-google",loginByGoogle)
routes.get("/logout",UserMiddlewere,logoutUser)
routes.get("/",UserMiddlewere,GetUser)
routes.put("/update",UserMiddlewere,UploadUser.fields([
  { name: "image", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]),updateUser)
export default routes