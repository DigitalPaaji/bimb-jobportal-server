import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { removeImage } from "../helper/DeleteImage";
import { Job } from "../models/jobModel";
import Category from "../models/jobCategoryModel";
import Subcategory from "../models/jobSubcateModel";
import { Application } from "../models/ApplicationModel";


export const createJob = async (req: Request,res: Response,next: NextFunction) => {
  const thumbnail = req.file as Express.Multer.File | undefined;

  const companyLogo = thumbnail
    ? `/uploads/jobs/${thumbnail.filename}`
    : null;

  try {
    const { title,description,jobType,workMode,companyName,companyWebsite,category,subcategory,location,
            experience,salary,education,skills,responsibilities,questions,requirements,benefits,applicationUrl,
            applicationDeadline,contactEmail,contactPhone,vacancies,status,isFeatured,isUrgent
    } = req.body;

    // --------------------------------
    // BASIC VALIDATION
    // --------------------------------

    if ( !title || typeof title !== "string" || !title.trim()) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

  if (!description || typeof description !== "string" ||!description.trim()) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Job description is required",
      });
    }

   if (!jobType) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Job type is required",
      });
    }

  if (!workMode) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Work mode is required",
      });
    }


   if (!companyName ||typeof companyName !== "string" ||!companyName.trim()) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

     if (!category) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    } 
    
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
  const jobTitle = title.trim();
   const slug =  `${jobTitle .toLowerCase() .trim() .replace(/[^a-z0-9\s-]/g, "") .replace(/\s+/g, "-") .replace(/-+/g, "-") .replace(/^-|-$/g, "")}-${randomNumber}`;


const job= await Job.create({
     title,description,jobType,workMode,companyName,companyWebsite,category,subcategory,slug,
location:JSON.parse(location),
experience:JSON.parse(experience),
salary:JSON.parse(salary),
education:JSON.parse(education),
skills:JSON.parse(skills),
responsibilities:JSON.parse(responsibilities),
questions:JSON.parse(questions),
requirements:JSON.parse(requirements),
benefits:JSON.parse(benefits),
applicationUrl,companyLogo:companyLogo,
applicationDeadline,contactEmail,contactPhone,vacancies,status,isFeatured:isFeatured=="true"? true:false,isUrgent:isUrgent=="true"? true:false
})



    return res.status(201).json({
      success: true,
      message: "Job created successfully",
    

    });

  

 

 

  

   
  } catch (error) {
    if (companyLogo) {
      removeImage(companyLogo);
    }

    next(error);
  }
};



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
 const filter: any = {};
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

    // Category
    if (
      category &&
      category !== "null" &&
      category !== "undefined" 
    ) {
      filter.category = category;
    }

    // Subcategory
    if (
      subcategory &&
      subcategory !== "null" &&
      subcategory !== "undefined" 
    ) {
      filter.subcategory = subcategory;
    }

    // Job Type
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
          "title companyName companyLogo status applicationsCount views category subcategory jobType workMode isFeatured isUrgent createdAt"
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


export const getJob =  async (req: Request,res: Response,next: NextFunction) => {
  try {
    
    const jobid = req.params.id;
    const typeQuery = req.query.viewtype
    let job;
if(typeQuery=="view"){
  job = await Job.findById(jobid).populate("category","title").populate("subcategory","title")
  
}else{
  job = await Job.findById(jobid)

}
   
if (!job) { return res.status(404).json({ success: false, message: "Job not found", }); }

    return res.status(200).json({ success: true, message: "Job fetched successfully", job, }); 

  } catch (error) {
    next(error)
  }
}
   




export const UpdateJob = async (req: Request,res: Response,next: NextFunction) => {
  const thumbnail = req.file as Express.Multer.File | undefined;

  const companyLogoNew = thumbnail
    ? `/uploads/jobs/${thumbnail.filename}`
    : null;

  try {
    const { title,description,jobType,workMode,companyName,companyWebsite,category,subcategory,location,
            experience,salary,education,skills,responsibilities,questions,requirements,benefits,applicationUrl,
            applicationDeadline,contactEmail,contactPhone,vacancies,status,isFeatured,isUrgent,companyLogo
    } = req.body;

   const jobId = req.params.id

    if ( !title || typeof title !== "string" || !title.trim()) {
      companyLogoNew && removeImage(companyLogoNew);

      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

  if (!description || typeof description !== "string" ||!description.trim()) {
      companyLogoNew && removeImage(companyLogoNew);

      return res.status(400).json({
        success: false,
        message: "Job description is required",
      });
    }

   if (!jobType) {
      companyLogoNew && removeImage(companyLogoNew);

      return res.status(400).json({
        success: false,
        message: "Job type is required",
      });
    }

  if (!workMode) {
      companyLogoNew && removeImage(companyLogoNew);

      return res.status(400).json({
        success: false,
        message: "Work mode is required",
      });
    }


   if (!companyName ||typeof companyName !== "string" ||!companyName.trim()) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

     if (!category) {
      companyLogo && removeImage(companyLogo);

      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    } 

    const job = await Job.findById(jobId)
    if(!job){
      companyLogoNew && removeImage(companyLogoNew);

      return res.status(400).json({
        success: false,
        message: "Job Not found",
      });
    }
    

job.title =title
job.description =description
job.jobType =jobType
job.workMode =workMode
job.companyName =companyName
job.companyWebsite =companyWebsite
job.category =category
job.subcategory =subcategory
job.location =JSON.parse(location)
job.experience =JSON.parse(experience)
job.salary =JSON.parse(salary)
job.education =JSON.parse(education)
job.skills =JSON.parse(skills)
job.responsibilities =JSON.parse(responsibilities)
job.questions =JSON.parse(questions)
job.requirements =JSON.parse(requirements)
job.benefits =JSON.parse(benefits)
job.applicationUrl =applicationUrl
job.applicationDeadline =applicationDeadline
job.contactEmail =contactEmail
job.contactPhone =contactPhone
job.vacancies =vacancies
job.status =status
job.isFeatured =isFeatured=="true"? true:false
job.isUrgent =isUrgent=="true"? true:false

if (companyLogo=="null") {
 
  
  if (job.companyLogo) { await removeImage(job.companyLogo); }
 job.companyLogo = null; 

}

if(companyLogoNew){
if (job.companyLogo) { await removeImage(job.companyLogo); }
  job.companyLogo =companyLogoNew
}



await job.save()




    return res.status(201).json({
      success: true,
      message: "Job Edit successfully",
    

    });

  

 

 

  

   
  } catch (error) {
    if (companyLogoNew) {
      removeImage(companyLogoNew);
    }

    next(error);
  }
};



export const getExpiredJobs =  async (req: Request,res: Response,next: NextFunction) => {
  try {
     const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = limit * (page-1);
    const search = req.query.search || "";
    const category = req.query.category || "";
    const subcategory = req.query.subcategory || "";
    const jobType = req.query.JobType || "";
    const workMode = req.query.WorkMode || "";
 const filter: any = {};

filter.applicationDeadline = { $lt: new Date(), };

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

    // Category
    if (
      category &&
      category !== "null" &&
      category !== "undefined" 
    ) {
      filter.category = category;
    }

    // Subcategory
    if (
      subcategory &&
      subcategory !== "null" &&
      subcategory !== "undefined" 
    ) {
      filter.subcategory = subcategory;
    }

    // Job Type
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
          "title companyName companyLogo status applicationsCount views category subcategory jobType workMode isFeatured isUrgent createdAt"
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




export const getAllApplications =  async (req: Request,res: Response,next: NextFunction) => {
  try {
     const page = Number(req.query.page) || 1
     const limit = Number(req.query.limit) || 20;
     const skip = limit * (page-1);
     const typeapp = String(req.query.typeapp || "today").toLowerCase();     
     const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

 let startDate: Date | null = null;

    if (typeapp === "today") {
      startDate = startOfToday;
    }

    if (typeapp === "week") {
      startDate = new Date(startOfToday);
      startDate.setDate(startDate.getDate() - 6);
    }

    if (typeapp === "month") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

const query: any = {};

    if (startDate) {
      query.appliedAt = {
        $gte: startDate,
        $lte: now,
      };
    }


    const total = await Application.countDocuments(query);


    const applications = await Application.find(query).populate("userId", "fullname email phone image resume").populate(
        "jobId",
        "title companyName companyLogo jobType workMode status"
      )
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();



       const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filter: typeapp,
    });

  } catch (error) {
    next(error)
  }
}


export const GetApplication = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const applicationId = req.params.id;
   const application = await Application.findById(applicationId)
      .populate(
        "userId",
        "fullname email phone image gender dateOfBirth address"
      )
      .populate({
        path: "jobId",
        select:
          "title description companyName companyLogo companyWebsite category subcategory vacancies applicationsCount jobType workMode status",
        populate: [
          {
            path: "category",
            select: "name slug description",
          },
          {
            path: "subcategory",
            select: "name slug description category",
          },
        ],
      });
       







     if(!application){
      return res.status(404).json({message:"Application not found"})
     }

     
  return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: application,
    });

  } catch (error) {
    next(error)
  }
}



export const UpdateApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicationId = req.params.id;

    const {
      status,
      recruiterNote,
      interview,
      shortlistedAt,
      interviewedAt,
      selectedAt,
      rejectedAt,
      withdrawnAt,
    } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update status
    if (status !== undefined) {
      const allowedStatuses = [
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
        "WITHDRAWN",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status",
        });
      }

      application.status = status;
    }

    // Recruiter note
    if (recruiterNote !== undefined) {
      application.recruiterNote = recruiterNote;
    }

    // Interview
    if (interview !== undefined) {
      application.interview = {
        date: interview.date || undefined,
        mode: interview.mode || undefined,
        meetingLink: interview.meetingLink || undefined,
        location: interview.location || undefined,
        note: interview.note || undefined,
      };
    }

    // Timeline dates
    if (shortlistedAt !== undefined) {
      application.shortlistedAt = shortlistedAt || undefined;
    }

    if (interviewedAt !== undefined) {
      application.interviewedAt = interviewedAt || undefined;
    }

    if (selectedAt !== undefined) {
      application.selectedAt = selectedAt || undefined;
    }

    if (rejectedAt !== undefined) {
      application.rejectedAt = rejectedAt || undefined;
    }

    if (withdrawnAt !== undefined) {
      application.withdrawnAt = withdrawnAt || undefined;
    }

    await application.save();

    const updatedApplication = await Application.findById(applicationId)
      .populate(
        "userId",
        "fullname email phone image gender dateOfBirth address"
      )
      .populate({
        path: "jobId",
        select:
          "title description companyName companyLogo companyWebsite category subcategory vacancies applicationsCount jobType workMode status",
        populate: [
          {
            path: "category",
            select: "name slug description",
          },
          {
            path: "subcategory",
            select: "name slug description category",
          },
        ],
      });

    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

export const getALLApplication_Job = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobId = req.params.id;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      100
    );

    const skip = (page - 1) * limit;

    // Check job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Total applications
    const total = await Application.countDocuments({
      jobId,
    });

    // Applications
    const applications = await Application.find({ jobId })
      .select(
        "userId jobId resume coverLetter answers status recruiterNote interview appliedAt shortlistedAt interviewedAt selectedAt rejectedAt withdrawnAt createdAt updatedAt"
      )
      .populate(
        "userId",
        "fullname email phone image gender dateOfBirth address resume"
      )
      .populate({
        path: "jobId",
        select:
          "title description companyName companyLogo companyWebsite category subcategory jobType workMode vacancies status applicationsCount",
        populate: [
          {
            path: "category",
            select: "name slug description",
          },
          {
            path: "subcategory",
            select: "name slug description category",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Job applications fetched successfully",
      data: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};






