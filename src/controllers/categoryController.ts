import type { NextFunction, Request, Response } from "express";
import Category from "../models/jobCategoryModel";
import Subcategory from "../models/jobSubcateModel";



export const CreateCategory= async(req:Request,res:Response,next:NextFunction)=>{
try {
const {title} = req.body
    if (!title || typeof title !== "string" || !title.trim()) { return res.status(400).json({ success: false, message: "Category title is required", }); }
 
   const categoryTitle = title.trim();
    const alreadyCategory = await Category.findOne({ title: { $regex: `^${categoryTitle}$`, $options: "i", }, });
  
 if (alreadyCategory) { return res.status(409).json({ success: false, message: "Category already exists", }); }
 const randomNumber = Math.floor(100000 + Math.random() * 900000);
 
 const slug = `${categoryTitle .toLowerCase() .trim() .replace(/[^a-z0-9\s-]/g, "") .replace(/\s+/g, "-") .replace(/-+/g, "-") .replace(/^-|-$/g, "")}-${randomNumber}`;
const category = await Category.create({ title: categoryTitle, slug, });

return res.status(201).json({ success: true, message: "Category created successfully", category});
} catch (error) {
    next(error)
}
}

export const getAllCategory = async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const allCategory = await Category.find();

   return res.status(200).json({success:true,allCategory})
         
    } catch (error) {
        next(error)
    }
}


export const DeleteCategory = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const catid = req.params.catid
      if (!catid) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }
    const category = await Category.findById(catid);

  if(!category){
   return res.status(409).json({ success: false, message: "Category not Found", }); 
  }

  if(category.jobs.length > 0 || category.subcat.length > 0 ){
 return res.status(409).json({
        success: false,
        message:
          "Category cannot be deleted because it contains jobs or subcategories",
        data: {
          jobs: category.jobs.length,
          subcategories: category.subcat.length,
        },
      });
  }

await category.deleteOne()

 return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      categoryId: catid,
    });

} catch (error) {
    next(error)
}

}

export const updateCategory = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {title} = req.body;
        const catid = req.params.catid;

 if (!catid) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }
      if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category title is required",
      });
    }
     const categoryTitle = title.trim();
         const category = await Category.findById(catid);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
          const alreadyExist = await Category.findOne({
      _id: { $ne: catid },
      title: {
        $regex: `^${categoryTitle.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
    });

          if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "Category with this title already exists",
      });
    }
          
       category.title = categoryTitle;
         
            await category.save();



          
        
         
 return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });




    } catch (error) {
        next(error)
    }
}












export const CreateSubCategory=async(req:Request,res:Response,next:NextFunction)=>{
    try {
     const {title,categoryId} = req.body;
    if (!title || typeof title !== "string" || !title.trim()) { return res.status(400).json({ success: false, message: " title is required", }); }
    if (!categoryId.trim()) { return res.status(400).json({ success: false, message: "Category  is required", }); }
       const subCategoryTitle = title.trim();
       const hasCate = await Category.findById(categoryId);
       if(!hasCate){
      return res.status(404).json({ success: false, message: "Category not found", });
       }
      const alreadyExist = await Subcategory.findOne({ category: categoryId, title: { $regex: `^${subCategoryTitle}$`, $options: "i", }, });
      if(alreadyExist){
       return res.status(409).json({ success: false, message: "Subcategory already exists in this category", });
      } 
    
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      const slug = `${subCategoryTitle.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}-${randomNumber}`;
      const SubCat = await Subcategory.create({title:subCategoryTitle,slug,category:categoryId})
      

      hasCate.subcat.push(SubCat._id)
      await hasCate.save();
   

      return res.status(201).json({ success: true, message: "Subcategory created successfully", subcategory: SubCat, });

    } catch (error) {
        next(error)
    }
}

export const getAllSubCategory = async(req:Request,res:Response,next:NextFunction)=>{
    try {
    const allCategory = await Subcategory.find().populate("category","title");

   return res.status(200).json({success:true,subCategory:allCategory})
         
    } catch (error) {
        next(error)
    }
}



export const DeleteSubCategory = async(req:Request,res:Response,next:NextFunction)=>{
try {
    const catid = req.params.subcatid
      if (!catid) {
      return res.status(400).json({
        success: false,
        message: "Sub Category ID is required",
      });
    }
    const subcate = await Subcategory.findById(catid);

  if(!subcate){
   return res.status(409).json({ success: false, message: "Sub-Category not Found", }); 
  }

  if(subcate.jobs.length > 0  ){
 return res.status(409).json({
        success: false,
        message:
          "Category cannot be deleted because it contains jobs ",
    
      });
  }


const cat =await Category.findById(subcate.category)
if(!cat){
    return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
}

 cat.subcat = cat.subcat.filter((item)=>item.toString() != subcate._id.toString())
await cat.save()

await subcate.deleteOne()

 return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      categoryId: catid,
    });

} catch (error) {
    next(error)
}

}




export const updateSubCategory = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {title} = req.body;
        const subcatid = req.params.subcatid;

 if (!subcatid) {
      return res.status(400).json({
        success: false,
        message: "Sub Category ID is required",
      });
    }
      if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sub Category title is required",
      });
    }
     const subcategoryTitle = title.trim();
         const subcategory = await Subcategory.findById(subcatid);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Sub Category not found",
      });
    }

  const alreadyExist = await Subcategory.findOne({title:subcategoryTitle,category:subcategory.category})



          if (alreadyExist) {
      return res.status(409).json({
        success: false,
        message: "Sub Category with this title already exists",
      });
    }
          
       subcategory.title = subcategoryTitle;
         
            await subcategory.save();



          
        
         
 return res.status(200).json({
      success: true,
      message: "Sub Category updated successfully",
    //   category,
    });




    } catch (error) {
        next(error)
    }
}

