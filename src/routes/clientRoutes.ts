import express from "express";
import { applyForCandidate, ForgotPasswordClient, GetCLient, loginByGoogleClient, loginClient, logoutUserClient, ResetPasswordClient, searchClientbysubcategory, SignupClient, verifyClient } from "../controllers/clientController";
import { ClientMiddlewere } from "../middlewere/ClientMiddlewere";

const routes = express.Router()

routes.get("/candidates/get/:id",searchClientbysubcategory)

routes.post("/signup",SignupClient)
routes.post("/verify",verifyClient)
routes.post("/login",loginClient)
routes.post("/login-google",loginByGoogleClient)
routes.get("/logout",ClientMiddlewere,logoutUserClient)
routes.get("/get",ClientMiddlewere,GetCLient)
routes.get("/apply-candidate/:id",ClientMiddlewere,applyForCandidate)


routes.put("/forgotpassword",ForgotPasswordClient)
routes.put("/resetpassword",ResetPasswordClient)

export default routes
