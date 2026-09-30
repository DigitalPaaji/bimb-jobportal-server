import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import redis from "../helper/redis";
import { SendForgotPasswordEmail, sendOtpUser } from "../helper/sendOtpUser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
import { removeImage } from "../helper/DeleteImage";
import crypto from "crypto";

export const SignupUser = async(req:Request,res:Response,next:NextFunction)=>{
try {
 const {fullname,email,password}= req.body;

  if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name Email and password are required",
      });
    }
  const allreadyuser = await User.findOne({email:email.toLowerCase()})
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

export const verifyUser=async(req:Request,res:Response,next:NextFunction)=>{
    try {
 const {email,password,otp,fullname}= req.body;

  if (!email || !password || !otp || !fullname) {
      return res.status(400).json({
        success: false,
        message: "fullname,Email and password are required",
      });
    }

const allreadyuser = await User.findOne({email:email.toLowerCase()})
   if(allreadyuser){
     throw new Error(" email allready Exist ")
   }


const storedOtp =  await redis.get(`user-bimb-email:-${email}`) 
        
   if(!storedOtp){throw new Error("Otp Expired")}
    if(storedOtp.toString()!= otp.toString()){throw new Error(" invalied Otp")}


const hashPassword =   await bcrypt.hash(password,10)



 const user = await User.create({email:email.toLowerCase(),password:hashPassword,fullname})

 const token = await jwt.sign({id:user._id} ,process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      })

  res.cookie("bimb-user", token, 
    { httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, });

    return res.status(200).json({
      success: true,
      message: "User Created successful"});
    } catch (error) {
        next(error)
    }
}






   
export const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    try {
 const {email,password}= req.body;

  if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

const user = await User.findOne({email:email.toLowerCase()}).select("+password")
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

  res.cookie("bimb-user", token, 
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
export const loginByGoogle=async(req:Request,res:Response,next:NextFunction)=>{
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
 
        let user = await User.findOne({ email });

 if (!user) {
      user = await User.create({
        fullname:name,
        email,
       image:picture
      
      });
    }


  const tokenjwt = await jwt.sign({id:user._id} ,process.env.JWT_SECRET!,
      {
        expiresIn: "60d",
      })

  res.cookie("bimb-user", tokenjwt, 
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




export const logoutUser = async(req:Request,res:Response,next:NextFunction)=>{
  try {
  
       res.clearCookie("bimb-user", 
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

export const GetUser= async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const user =req.user;

    return res.status(200).json({success:true,user})
  } catch (error) {
    next(error)
  }
}


const DeletImg=async(thumbnailPath :string | null)=>{
   if(thumbnailPath){
          await removeImage(thumbnailPath)
        }
}
export const updateUser = async(req:Request,res:Response,next:NextFunction)=>{
   
 const files = req.files as {
  image?: Express.Multer.File[];
  resume?: Express.Multer.File[];
};
const imageFile = files?.image?.[0];
const resumeFile = files?.resume?.[0];

const imagePath = imageFile
  ? `/uploads/user/${imageFile.filename}`
  : "";

const resumePath = resumeFile
  ? `/uploads/user/${resumeFile.filename}`
  : "";

  try {
 const getuser = req.user;
if(!getuser || !getuser._id){
      DeletImg(imagePath)
    DeletImg(resumePath)
return res.status(404).json({success:false,message:"User not found "})
}
 const  {fullname,phone,gender,dateOfBirth,address } = req.body 
    if(!fullname){
  return res.status(404).json({success:false,message:"Full Name required"})
    }
const  user = await User.findById(getuser._id);



if(!user ){
    DeletImg(imagePath)
    DeletImg(resumePath)
return res.status(404).json({success:false,message:"User not found "})
}
    
  user.fullname=fullname
  user.phone=phone
  user.gender=gender
  user.dateOfBirth=dateOfBirth
  user.address=address

  if(imagePath){
    user?.image  && DeletImg(user.image)
    user.image=imagePath
  }

  if(resumePath){
    user?.resume  && DeletImg(user.resume) 
    user.resume=resumePath
  }
 

  await user.save()


  return res.status(200).json({success:true,message:"user updated",user})

  } catch (error) {
    DeletImg(imagePath)
    DeletImg(resumePath)
    next(error)
  }
}



export const ForgotPassword = async(req:Request,res:Response,next:NextFunction)=>{
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
const user = await User.findOne({ email });
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



export const ResetPassword  = async(req:Request,res:Response,next:NextFunction)=>{
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


