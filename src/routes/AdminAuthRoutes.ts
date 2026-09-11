import express from  "express";
import { createAdmin, DashBoardData, GetAdmin, HandelSetting, LoginAdmin, logoutAdmin, VerifyAdmin, verifyOtpSetting } from "../controllers/adminAuthController";
import { verifyAdminMiddleware } from "../middlewere/AdminMiddlewere";

const route = express.Router()

route.post("/create",createAdmin)
route.post("/login",LoginAdmin)
route.post("/verify",VerifyAdmin)
route.get("/admin-verify",verifyAdminMiddleware,GetAdmin)
route.get("/logout",verifyAdminMiddleware,logoutAdmin)
route.get("/dashboad",verifyAdminMiddleware,DashBoardData)

route.put("/update-profile",verifyAdminMiddleware,HandelSetting)
route.put("/verify-profile-otp",verifyAdminMiddleware,verifyOtpSetting)






export default route