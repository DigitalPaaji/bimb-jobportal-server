import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Admin } from "../models/adminModel";
import jwt from "jsonwebtoken";
import { sendOtpMail } from "../helper/sendOtpMail";
import redis from "../helper/redis";
import User from "../models/userModel";
import { Job } from "../models/jobModel";
import { Application } from "../models/ApplicationModel";
import Category from "../models/jobCategoryModel";
import Subcategory from "../models/jobSubcateModel";
import Article from "../models/ArticleModel";


export const createAdmin= async(req:Request,res:Response,next:NextFunction)=>{
    try {
         const {name, email, password } = req.body;

 if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name , Email and password are required",
      });
    }

const allreadyAdmin= await Admin.findOne({email})

if(allreadyAdmin){
    throw new Error("Email Allready exist")
}

const hashPassword =   await bcrypt.hash(password,10)


await Admin.create({name,email:email.toLowerCase(),password:hashPassword})


return res.status(201).json({success:true,message:"Admin created"})
    } catch (error) {
        next(error)
    }
}


export const LoginAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
      const {email,password} = req.body;
      
        if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


   const admin = await Admin
      .findOne({ email: email.toLowerCase() })
      .select("+password");
     if (!admin) {throw new Error("Invalid email or password")}

 if (!admin.isActive) {throw new Error("Admin account is disabled")}

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );
   if (!passwordMatch) {throw new Error("Invalid email or password")}  
    
   const otp = Math.floor(100000 + Math.random() * 900000)
     
   await sendOtpMail(email,`${otp}`)
   
   await redis.set(`email:-${email}`,otp,{
    EX:600
   }) 
 

    return res.status(200).json({
      success: true,
      message: "Otp send SuccessFully"
    });

    } catch (error) {
        next(error)
    }
}

export const VerifyAdmin = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {email,password,otp}= req.body;
  if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


   const admin = await Admin
      .findOne({ email: email.toLowerCase() })
      .select("+password");
     if (!admin) {throw new Error("Invalid email or password")}

 if (!admin.isActive) {throw new Error("Admin account is disabled")}

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );
   if (!passwordMatch) {throw new Error("Invalid email or password")}  
    
  
   
   const storedOtp =  await redis.get(`email:-${email}`) 
 
   if(!storedOtp){throw new Error("Otp Expired")}
    if(storedOtp.toString()!= otp.toString()){throw new Error(" invalied Otp")}

    const sessionId = crypto.randomUUID();
      admin.sessionId = sessionId;     
       admin.lastLogin = new Date();
        await admin.save();

      const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        sessionId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "10d",
      }
    ); 



   res.cookie("Admin", token, 
    { httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, });

    return res.status(200).json({
      success: true,
      message: "Admin login successful"});




    } catch (error) {
        next(error)
    }
}

export const GetAdmin= async(req:Request,res:Response,next:NextFunction)=>{
  try {
 const admin = req.admin;

return res.status(200).json({success:true,admin})
  } catch (error) {
    next(error)
  }
}

export const logoutAdmin = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    res.clearCookie("Admin", 
      { httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
         sameSite: "lax", });
         
    return res.status(200).json({ success: true, 
      message: "Admin logged out successfully" });
  } catch (error) {
    next(error)
  }
}


export const HandelSetting = async(req:Request,res:Response,next:NextFunction)=>{
 try {
      const {email,password} = req.body;
      
        if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


   const admin = await Admin
      .findOne({ email: email.toLowerCase() })
      .select("+password");
     if (!admin) {throw new Error("Invalid email or password")}

 if (!admin.isActive) {throw new Error("Admin account is disabled")}

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );
   if (!passwordMatch) {throw new Error("Invalid email or password")}  
    
   const otp = Math.floor(100000 + Math.random() * 900000)
     
   await sendOtpMail(email,`${otp}`)
   
   await redis.set(`email-reset:-${email}`,otp,{
    EX:600
   }) 
 

    return res.status(200).json({
      success: true,
      message: "Otp send SuccessFully"
    });

    } catch (error) {
        next(error)
    }
}

export const verifyOtpSetting= async(req:Request,res:Response,next:NextFunction)=>{
  try {
    
    const {email,password,otp,newemail,newpassword} = req.body
    
      if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }


   const admin = await Admin
      .findOne({ email: email.toLowerCase() })
      .select("+password");
     if (!admin) {throw new Error("Invalid email or password")}

 if (!admin.isActive) {throw new Error("Admin account is disabled")}

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );
   if (!passwordMatch) {throw new Error("Invalid email or password")}  
    
  
   
   const storedOtp =  await redis.get(`email-reset:-${email}`) 
 
   if(!storedOtp){throw new Error("Otp Expired")}
    if(storedOtp.toString()!= otp.toString()){throw new Error(" invalied Otp")}

if(newemail){ admin.email = newemail.toLowerCase()}




if(newpassword){
const hashPassword =   await bcrypt.hash(newpassword,10)
admin.password = hashPassword

}
 await admin.save()

       res.clearCookie("Admin", { httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
         sameSite: "lax", });

 return res.status(200).json({success:true,message:"Setting updated"})


            
  } catch (error) {
    next(error)
  }
}








export const DashBoardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Run all count queries together
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCategories,
      totalSubCategories,
      totalArticles,

      // Application status counts
      pendingApplications,
      shortlistedApplications,
      interviewApplications,
      selectedApplications,
      rejectedApplications,

      // Job status
      publishedJobs,
      draftJobs,
      closedJobs,
    ] = await Promise.all([
      User.countDocuments(),

      Job.countDocuments(),

      Application.countDocuments(),

      Category.countDocuments(),

      Subcategory.countDocuments(),

      Article.countDocuments(),

      Application.countDocuments({
        status: "APPLIED",
      }),

      Application.countDocuments({
        status: "SHORTLISTED",
      }),

      Application.countDocuments({
        status: "INTERVIEW",
      }),

      Application.countDocuments({
        status: "SELECTED",
      }),

      Application.countDocuments({
        status: "REJECTED",
      }),

      Job.countDocuments({
        status: "PUBLISHED",
      }),

      Job.countDocuments({
        status: "DRAFT",
      }),

      Job.countDocuments({
        status: "CLOSED",
      }),
    ]);

    // Recent applications
    const recentApplications = await Application.find()
      .populate({
        path: "userId",
        select: "fullname email phone image",
      })
      .populate({
        path: "jobId",
        select: "title companyName companyLogo",
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Recent users
    const recentUsers = await User.find()
      .select("fullname email phone image status createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Categories with number of subcategories
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "categoryId",
          as: "subcategories",
        },
      },
      {
        $project: {
          title: 1,
          name: 1,
          image: 1,
          subCategoryCount: {
            $size: "$subcategories",
          },
        },
      },
      {
        $sort: {
          subCategoryCount: -1,
        },
      },
    ]);

    // Application statistics
    const applicationStats = [
      {
        name: "Applied",
        value: pendingApplications,
      },
      {
        name: "Shortlisted",
        value: shortlistedApplications,
      },
      {
        name: "Interview",
        value: interviewApplications,
      },
      {
        name: "Selected",
        value: selectedApplications,
      },
      {
        name: "Rejected",
        value: rejectedApplications,
      },
    ];

    // Final dashboard response
    const dashboardData = {
      overview: {
        users: totalUsers,
        jobs: totalJobs,
        applications: totalApplications,
        categories: totalCategories,
        subCategories: totalSubCategories,
        articles: totalArticles,
      },

      jobs: {
        total: totalJobs,
        published: publishedJobs,
        draft: draftJobs,
        closed: closedJobs,
      },

      applications: {
        total: totalApplications,
        applied: pendingApplications,
        shortlisted: shortlistedApplications,
        interview: interviewApplications,
        selected: selectedApplications,
        rejected: rejectedApplications,
      },

      applicationStats,

      categories,

      recentApplications,

      recentUsers,
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};














//   const sessionId = crypto.randomUUID();
//           admin.sessionId = sessionId;
//     admin.lastLogin = new Date();
//   await admin.save();

//   const token = jwt.sign(
//       {
//         adminId: admin._id.toString(),
//         sessionId,
//       },
//       process.env.JWT_SECRET!,
//       {
//         expiresIn: "1d",
//       }
//     );


