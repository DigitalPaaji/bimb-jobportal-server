import express from "express";
import { getmyArticles, getmyuserArticles, getSingleuserArticle } from "../controllers/ArticleController";

const route = express.Router();


route.get("/get",getmyuserArticles)
route.get("/get/:slug",getSingleuserArticle)


export default route