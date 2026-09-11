import express from "express"
import { CreateDes, deleteArticleDes, getSingleArticle, GetArticleDes, getmyArticles, UpdateArticleDes, UpdateArticle, deleteArticle, CreateArticle } from "../controllers/ArticleController";
import { verifyAdminMiddleware } from "../middlewere/AdminMiddlewere";
import { articleUpload } from "../helper/UploadArticle";
const routes  = express.Router();

routes.post("/create",verifyAdminMiddleware,articleUpload.single("image"),CreateArticle)
routes.post("/des/add",verifyAdminMiddleware,articleUpload.single("image"),CreateDes)
routes.get("/get-all",verifyAdminMiddleware,getmyArticles)
routes.get("/get-content/:articleid",verifyAdminMiddleware,GetArticleDes)
routes.get("/get-article/:articleid",verifyAdminMiddleware,getSingleArticle)

routes.delete("/des/delete/:articleid/:desid",verifyAdminMiddleware,deleteArticleDes)
routes.delete("/delete/:articleid",verifyAdminMiddleware,deleteArticle)
routes.put("/des/update/:desid",verifyAdminMiddleware,articleUpload.single("image"),UpdateArticleDes)
routes.put("/update-article/:articleid",verifyAdminMiddleware,articleUpload.single("thumbnail"),UpdateArticle)


export default routes

