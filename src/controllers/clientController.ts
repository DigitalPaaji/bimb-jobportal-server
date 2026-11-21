import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { Application } from "../models/ApplicationModel";
import { Job } from "../models/jobModel";
import Client from "../models/clientModel";
import redis from "../helper/redis";
import { SendForgotPasswordEmail, sendOtpUser } from "../helper/sendOtpUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
import { removeImage } from "../helper/DeleteImage";
import crypto from "crypto";
import { CandidateSelect } from "../models/candidateSelect";
import mongoose from "mongoose";


export const searchClientbysubcategory = async(req: Request,res: Response,next: NextFunction)=>{
    try {

const subcategory = req.params.id;

const page = Number(req.query.page) || 1;
const limit = 20



const skip =  (page-1) * limit
const [candidates,totalCandidates]= await Promise.all([
 Application.find({status:"SELECTED",subcategory}).select("userId jobId ").populate("userId","fullname image gender").populate("jobId","title description jobType workMode skills") .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
Application.countDocuments({
        status: "SELECTED",
        subcategory,
      }),
])
        
  return res.status(200).json({
      success: true,
      message: "Candidates fetched successfully",
      data: candidates,
      pagination: {
        currentPage: page,
        limit,
        totalCandidates,
        totalPages: Math.ceil(totalCandidates / limit),
        hasNextPage: page < Math.ceil(totalCandidates / limit),
        hasPrevPage: page > 1,
      },
    });
    } catch (error) {
        next(error)
    }
}




export const SignupClient = async(req:Request,res:Response,next:NextFunction)=>{
try {
 const {fullname,email,password}= req.body;

  if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name Email and password are required",
      });
    }
  const allreadyuser = await Client.findOne({email:email.toLowerCase()})
   if(allreadyuser){
     throw new Error(" email allready Exist ")
   }
    
    
 const otp = Math.floor(100000 + Math.random() * 900000)
     
   await sendOtpUser(email,`${otp}`)
   
   await redis.set(`user-bimb-email:-${email}`,otp,{
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



export const verifyClient=async(req:Request,res:Response,next:NextFunction)=>{
    try {
 const {email,password,otp,fullname}= req.body;

  if (!email || !password || !otp || !fullname) {
      return res.status(400).json({
        success: false,
        message: "fullname,Email and password are required",
      });
    }

const allreadyuser = await Client.findOne({email:email.toLowerCase()})
   if(allreadyuser){
     throw new Error(" email allready Exist ")
   }


const storedOtp =  await redis.get(`user-bimb-email:-${email}`) 
        
   if(!storedOtp){throw new Error("Otp Expired")}
    if(storedOtp.toString()!= otp.toString()){throw new Error(" invalied Otp")}


const hashPassword =   await bcrypt.hash(password,10)



 const user = await Client.create({email:email.toLowerCase(),password:hashPassword,fullname})

 const token = await jwt.sign({id:user._id} ,process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      })

  res.cookie("bimb-client", token, 
    { httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, });

    return res.status(200).json({
      success: true,
      message: "Client Created successful"});
    } catch (error) {
        next(error)
    }
}




export const loginClient=async(req:Request,res:Response,next:NextFunction)=>{
    try {
 const {email,password}= req.body;

  if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

const user = await Client.findOne({email:email.toLowerCase()}).select("+password")
   if(!user || !user.password){
     throw new Error(" Invalid email or password")
   }

 const passwordMatch = await bcrypt.compare(
      password,
      user?.password
    );

 if (!passwordMatch) {throw new Error("Invalid email or password")}  


 const token = await jwt.sign({id:user._id} ,process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      })

  res.cookie("bimb-client", token, 
    { httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, });

    return res.status(200).json({
      success: true,
      message: "User login successful"});
    } catch (error) {
        next(error)
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
export const loginByGoogleClient=async(req:Request,res:Response,next:NextFunction)=>{
  try {
  const {token} = req.body;
  if(!token){
    return
  }
 const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
const payload = ticket.getPayload();
    const { email, name,picture } = payload as any;
 
        let user = await Client.findOne({ email });

 if (!user) {
      user = await Client.create({
        fullname:name,
        email,
       image:picture
      
      });
    }


  const tokenjwt = await jwt.sign({id:user._id} ,process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      })

  res.cookie("bimb-client", tokenjwt, 
    { httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, });



    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
   
    });

    
}  catch (error) {
    next(error)
  }
}




export const logoutUserClient = async(req:Request,res:Response,next:NextFunction)=>{
  try {
  
       res.clearCookie("bimb-client", 
       { httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, }
     );
   return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error)
  }
}



export const GetCLient= async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const user =req.client;

    return res.status(200).json({success:true,user})
  } catch (error) {
    next(error)
  }
}



export const ForgotPasswordClient = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

   if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
const user = await Client.findOne({ email });
  const message =
      "If an account exists with this email, a reset link will be sent.";
   if (!user) {
      return res.status(200).json({
        success: true,
        message,
      });
    }


 const token = crypto.randomBytes(32).toString("hex");
 const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
const redisKey = `password-reset:${hashedToken}`;

 await redis.set(
      redisKey,
      user._id.toString(),
      { EX: 900 }
    );
 const resetLink = `${process.env.FRONTEND_URL_ONE}/reset-password?token=${token}`
  try {
      await SendForgotPasswordEmail(user.email, resetLink);
    } catch (error) {
      await redis.del(redisKey);
      throw error;
    }

    return res.status(200).json({
      success: true,
      message,
    });
} catch (error) {
  next(error)
}
}



export const ResetPasswordClient  = async(req:Request,res:Response,next:NextFunction)=>{
try {
const { token, password, confirmPassword } = req.body;

  if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

     if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters",
      });
    }
if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

const redisKey = `password-reset:${hashedToken}`;
 const userId = await redis.get(redisKey);

    if (!userId) {
      await redis.del(redisKey)
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired",
      });
    }

 await redis.del(redisKey)

   const user = await User.findById(userId);

  if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired",
      });
    }

user.password = await bcrypt.hash(password, 12);
    await user.save();

 return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });








} catch (error) {
  next(error)
}

}



export const applyForCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.client;
    const applicationId = req.params.id;

    // Check ID type and validity
    if (
      typeof applicationId !== "string" ||
      !mongoose.Types.ObjectId.isValid(applicationId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // Convert string to ObjectId
    const applicationObjectId = new mongoose.Types.ObjectId(applicationId);

    // Check duplicate selection
    const isExists = await CandidateSelect.exists({
      clientId: user?._id,
      applicationID: applicationObjectId,
    });

    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "Already selected",
      });
    }

    // Create selection
    await CandidateSelect.create({
      clientId: user?._id,
      applicationID: applicationObjectId,
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message: "Candidate selected successfully",
    });

  } catch (error) {
    next(error);
  }
};


