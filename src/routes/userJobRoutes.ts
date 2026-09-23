import express from  "express";

import { UserMiddlewere } from "../middlewere/UserMiddlewere";
import { ApplyForJob, getApplyedJob, getCategory, getFetureJob, getJobs, getSingleJob, getSubCategory, getUrgentJob } from "../controllers/userJobController";
const routes  = express.Router();
routes.get("/alljobs",getJobs)
routes.get("/category",getCategory)
routes.get("/sub-category",getSubCategory)
routes.get("/feturejob",getFetureJob)
routes.get("/isurgent",getUrgentJob)
routes.get("/singlejob/:slug",getSingleJob)



routes.post("/apply",UserMiddlewere,ApplyForJob)
routes.get("/applyed",UserMiddlewere,getApplyedJob)



export default routes