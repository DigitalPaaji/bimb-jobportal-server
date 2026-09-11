import express from  "express";
import { verifyAdminMiddleware } from "../middlewere/AdminMiddlewere";
import { jobUpload } from "../helper/UploadJobImage";
import { createJob, getALLApplication_Job, getAllApplications, GetApplication, getExpiredJobs, getJob, getJobs, UpdateApplication, UpdateJob } from "../controllers/jobController";


const route = express.Router()

route.post("/create",verifyAdminMiddleware,jobUpload.single("image"),createJob)
route.get("/get",verifyAdminMiddleware,getJobs)
route.get("/get/:id",verifyAdminMiddleware,getJob)
route.get("/get-expired",verifyAdminMiddleware,getExpiredJobs)
route.get("/application",verifyAdminMiddleware,getAllApplications)
route.get("/application/:id",verifyAdminMiddleware,GetApplication)

route.get("/allapplication/:id",verifyAdminMiddleware,getALLApplication_Job)


route.put("/application/:id",verifyAdminMiddleware,UpdateApplication)


route.put("/update/:id",verifyAdminMiddleware,jobUpload.single("image"),UpdateJob)









export default route