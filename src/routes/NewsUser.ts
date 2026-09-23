import express from "express";
import { getSingleUSerNews, getUserNews } from "../controllers/NewsController";

const route = express.Router();


route.get("/get",getUserNews)
route.get("/get/:slug",getSingleUSerNews)


export default route