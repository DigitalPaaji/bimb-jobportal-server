import express from "express"

import { createNews, DeleteNews, editNews, getNews, getSingleNews } from "../controllers/NewsController";
import { verifyAdminMiddleware } from "../middlewere/AdminMiddlewere";
import { eventNews } from "../helper/UploadNews";

const routes  = express.Router();


routes.post("/create",verifyAdminMiddleware,eventNews.single("image"),createNews as any)
routes.get("/get",verifyAdminMiddleware,getNews as any)
routes.get("/get/:id",verifyAdminMiddleware,getSingleNews as any)
routes.put("/update/:id",verifyAdminMiddleware,eventNews.single("image"),editNews as any)

routes.delete("/delete/:id",verifyAdminMiddleware,DeleteNews as any)







export default routes