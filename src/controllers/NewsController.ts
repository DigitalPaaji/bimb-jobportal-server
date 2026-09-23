import type { NextFunction, Request, Response } from "express";
import { removeImage } from "../helper/DeleteImage";

import slugify from "slugify"
import { News } from "../models/newsModel";


const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}


export const createNews = async(req:Request,res:Response,next:NextFunction)=>{

const image = req.file as Express.Multer.File || undefined;
 const imagePath = image
      ? `/uploads/news/${image.filename}`
      : "";


try {

    const {title,description,publicationDate,category} = req.body
if(!title || !description || !publicationDate || !category ){
DeletImg(imagePath)
  return res.status(400).json({
        success: false,
        message: "Title, description, publicationDate, and category are required",
      });

}

if(!imagePath){
  return res.status(400).json({
        success: false,
        message: "Image is required",
      });   
}

 const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

const slug = `${baseSlug}-${Date.now()}`;



const news = await News.create({
    title,description,publicationDate,category,featuredImage:imagePath,slug
})

return res.status(201).json({
      success: true,
      message: "News created successfully",
      news,
    });

} catch (error) {
    next(error)
}

}




export const getNews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
     

const news = await News.find().select("title featuredImage publicationDate category rejected ")

return res.status(200).json({
    success:true,
    news
})
    } catch (error) {
        next(error)
    }
}


export const getSingleNews= async(req:Request,res:Response,next:NextFunction)=>{
    try {
    
        const newsId = req?.params?.id;

         const news = await News.findById(newsId);

         if(!news){
            return res.status(404).json({
                success:false,
                message:"news not Find"
            })
         }

return res.status(200).json({
    success:true,
    news
})



    } catch (error) {
        next(error)
    }
}

export const editNews = async(req:Request,res:Response,next:NextFunction)=>{
const image = req.file as Express.Multer.File || undefined;
 const imagePath = image
      ? `/uploads/news/${image.filename}`
      : "";

 
    try {
 const {title,description,publicationDate,category}= req.body;

 const newsId = req?.params?.id;


if (!title || !description || !publicationDate || !category) {
 DeletImg(imagePath);

      return res.status(400).json({
        success: false,
        message: "Title, description, publicationDate and category are required",
      });
    }



const news = await News.findById(newsId);

         if(!news){
            return res.status(404).json({
                success:false,
                message:"news not Find"
            })
         }

news.title=title
news.description=description
news.publicationDate=publicationDate
news.category=category

if(imagePath){
  DeletImg(news.featuredImage as string); 
  
  news.featuredImage=imagePath
}
news.save()



 return res.status(201).json({
      success: true,
      message: "news updated successfully",
      news,
    });


    } catch (error) {
        DeletImg(imagePath)
        next(error)
    }
}

export const DeleteNews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
      
 const newsId = req?.params?.id;  

 const news = await News.findById(newsId);

if(!news){
     return res.status(404).json({
                success:false,
                message:"news not Find"
            })  
}
if(news?.featuredImage){
    DeletImg(news.featuredImage as string)

}

await news.deleteOne()

  return res.status(200).json({
                success:true,
                message:"news deleted"
            })  

    } catch (error) {
        next(error)
    }
}



export const getUserNews = async(req:Request,res:Response,next:NextFunction)=>{
    try {
     

const news = await News.find({rejected:false}).select("title featuredImage publicationDate category ")

return res.status(200).json({
    success:true,
    news
})
    } catch (error) {
        next(error)
    }
}




export const getSingleUSerNews= async(req:Request,res:Response,next:NextFunction)=>{
    try {
    
        const slug = req?.params?.slug;

         const news = await News.findOne({slug});

         if(!news){
            return res.status(404).json({
                success:false,
                message:"news not Find"
            })
         }

return res.status(200).json({
    success:true,
    news
})



    } catch (error) {
        next(error)
    }
}
