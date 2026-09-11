import type { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Admin } from "../models/adminModel";

interface AdminTokenPayload extends JwtPayload {
  adminId: string;
  sessionId: string;
}

export const verifyAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.Admin;

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
    ) as AdminTokenPayload;

    // Validate payload
    if (!decoded?.adminId || !decoded?.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // Check admin + current session
    const admin = await Admin.findOne({
      _id: decoded.adminId,
      sessionId: decoded.sessionId,
      isActive: true,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Session expired or admin account is inactive.",
      });
    }

    //   req.admin as any
    req.admin = admin;

    // Continue to controller
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