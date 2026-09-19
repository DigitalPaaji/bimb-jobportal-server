import type { NextFunction, Request, Response } from "express";

import { Job } from "../models/jobModel";
import Category from "../models/jobCategoryModel";
import Subcategory from "../models/jobSubcateModel";
import User from "../models/userModel";
import { Application } from "../models/ApplicationModel";




export const getJobs =  async (req: Request,res: Response,next: NextFunction) => {
  try {
     const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = limit * (page-1);
    const search = req.query.search || "";
    const category = req.query.category || "";
    const subcategory = req.query.subcategory || "";
    const jobType = req.query.JobType || "";
    const workMode = req.query.WorkMode || "";
    const filter: any = {
        status:"PUBLISHED"
    };
     if (search && search !== "null" && search !== "undefined") {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }


    if (
      category &&
      category !== "null" &&
      category !== "undefined" 
    ) {
      filter.category = category;
    }

  
    if (
      subcategory &&
      subcategory !== "null" &&
      subcategory !== "undefined" 
    ) {
      filter.subcategory = subcategory;
    }
    if (
      jobType &&
      jobType !== "null" &&
      jobType !== "undefined"
    ) {
      filter.jobType = jobType;
    }

    // Work Mode
    if (
      workMode &&
      workMode !== "null" &&
      workMode !== "undefined"
    ) {
      filter.workMode = workMode;
    }
   

const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .select(
          "title companyName slug companyLogo status applicationsCount  category subcategory jobType workMode isFeatured isUrgent createdAt"
        )
        .populate("category", "title")
        .populate("subcategory", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Job.countDocuments(filter),
    ]);


 const totalPages = Math.ceil(totalJobs / limit);

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",

      data: jobs,

      pagination: {
        currentPage: page,
        limit,
        totalJobs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

    
  } catch (error) {
    next(error)
  }
}

export const getCategory=  async (req: Request,res: Response,next: NextFunction) => {
    try {
    
        const category = await Category.find().populate("subcat","-category")
        
    return res.status(200).json({success:true,category})
    } catch (error) {
        next(error)
    }
}



export const getFetureJob = async (req:Request,res:Response,next:NextFunction)=>{
  try {
   const jobs = await Job.find({isFeatured:true}).select(
          "title companyName companyLogo status applicationsCount  category subcategory jobType workMode isFeatured isUrgent createdAt"
        )
        .populate("category", "title")
        .populate("subcategory", "title")
        .sort({ createdAt: -1 })


        return res.status(200).json({Success:true,jobs})
    

  } catch (error) {
    next(error)
  }
}

export const getUrgentJob = async (req:Request,res:Response,next:NextFunction)=>{
  try {
   const jobs = await Job.find({isUrgent:true}).select(
          "title companyName companyLogo status applicationsCount  category subcategory jobType workMode isFeatured isUrgent createdAt"
        )
        .populate("category", "title")
        .populate("subcategory", "title")
        .sort({ createdAt: -1 })


        return res.status(200).json({Success:true,jobs})
    

  } catch (error) {
    next(error)
  }
}

export const getSingleJob = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const slug = req.params.slug;
   const job  = await Job.findOne({slug,status:"PUBLISHED"}).populate("category", "title")
        .populate("subcategory", "title")
  if(!job){
return res.status(404).json({
  success:false,message:"Job not found"
})
  }

job.views = job.views + 1

await job.save()
return res.status(200).json({success:true,job})


  } catch (error) {
    next(error)
  }
}



export const getSubCategory=  async (req: Request,res: Response,next: NextFunction) => {
    try {
    
        const subcategory = await Subcategory.find().populate("category","-subcat")
        return res.status(200).json({success:true,subcategory})
    } catch (error) {
        next(error)
    }
}

export const ApplyForJob= async(req: Request,res: Response,next: NextFunction)=>{
    try {
     const getuser = req.user
     if(!getuser || !getuser._id){
        return res.status(404).json({success:false,message:"User Required"})
     }
     const {jobId,coverLetter,answers} = req.body
       

const job = await Job.findById(jobId);

if(!job){
        return res.status(404).json({success:false,message:"Job Not Found"})
     }
   if(job.status !="PUBLISHED"){return res.status(404).json({success:false,message:"Job Not PUBLISHED"})}
    const  user = await  User.findById(getuser._id)



   if(!user || !user._id){return res.status(404).json({success:false,message:"User Required"})}


   if(!user.resume){ return res.status(404).json({success:false,message:"Upload Resume First"})}

const allReady_Applied = await Application.findOne({
  userId:user._id,
jobId:job._id,   
})

if(allReady_Applied){
    return res.status(401).json({success:true,message:"You allready applied"})
} 




     const application = await Application.create({
        userId:user._id,
        jobId:job._id,
        resume:user.resume,
        coverLetter,
        answers
     })
     

    job.applicationsCount++
    await job.save()

    user.jobappled.push(job._id)
     user.save()

return res.status(200).json({success:true,message:"job application submited"})



    } catch (error) {
        next(error)
    }
}





