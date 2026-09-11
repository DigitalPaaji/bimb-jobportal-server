import type { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Admin } from "../models/adminModel";
import User from "../models/userModel";

interface UserTokenPayload extends JwtPayload {
id:string
}

export const UserMiddlewere = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies['bimb-user'];

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as UserTokenPayload;

    // Validate payload
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }



    const user = await User.findById(decoded?.id)
   

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user account is inactive.",
      });
    }

    req.user = user;

 
    return next();
  } catch (error: any) {
    console.error("Admin authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};