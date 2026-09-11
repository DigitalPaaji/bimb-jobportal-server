import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { equal } from "node:assert";



export const getUsers = async(req:Request,res:Response,next:NextFunction)=>{
try {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = limit * (page-1);
  const search = req.query.search 
  const filter: any = {};
        if (search && search !== "null" && search !== "undefined") {
 filter.$or = [
        {
          fullname: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];

        }


        const [ users,totalUsers]= await Promise.all([
            await User.find(filter).skip(skip).select("fullname email phone image status").sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
          await User.countDocuments(filter)


        ])


 const totalPages = Math.ceil(totalUsers / limit);
        return res.status(200).json({success:true,
         users,
         pagination: {
        currentPage: page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

        })

} catch (error) {
    next(error)
}
}

export const getUser = async(req:Request,res:Response,next:NextFunction)=>{
  try {
     const userId = req.params.id;
     
     const user = await User.findById(userId).populate("jobappled","title companyName companyLogo status applicationsCount views  jobType workMode isFeatured isUrgent createdAt")
     if(!user){
      return res.status(404).json({success:false,message:"User not found"})
     }

    return res.status(200).json({success:true,user})
    

  } catch (error) {
    next(error)
  }
}

export const ToggleStatus = async(req:Request,res:Response,next:NextFunction)=>{
try {
     const userId = req.params.id;
     const {status} =req.body
     const user = await User.findById(userId)
  if(!user){
      return res.status(404).json({success:false,message:"User not found"})
     }
   
     user.status = status
     


     await user.save()

     return res.status(200).json({success:true})


  } catch (error) {
    next(error)
  }
}