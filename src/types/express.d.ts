import { IAdmin } from "../models/adminModel";
import { IUser } from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      user?:IUser;
    }
  }
}

export {};