import express from  "express";
import { verifyAdminMiddleware } from "../middlewere/AdminMiddlewere";
import { CreateCategory, CreateSubCategory, DeleteCategory, DeleteSubCategory, getAllCategory, getAllSubCategory, updateCategory, updateSubCategory } from "../controllers/categoryController";

const route = express.Router()



route.post("/create",verifyAdminMiddleware,CreateCategory)
route.get("/get",verifyAdminMiddleware,getAllCategory)
route.delete("/delete/:catid",verifyAdminMiddleware,DeleteCategory)
route.put("/update/:catid",verifyAdminMiddleware,updateCategory)


 
    

route.post("/sub/create",verifyAdminMiddleware,CreateSubCategory)
route.get("/sub/get",verifyAdminMiddleware,getAllSubCategory)

route.delete("/sub/delete/:subcatid",verifyAdminMiddleware,DeleteSubCategory)
route.put("/sub/update/:subcatid",verifyAdminMiddleware,updateSubCategory)

export default route