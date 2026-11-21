import { IAdmin } from "../models/adminModel";
import { IClient } from "../models/clientModel";
import { IUser } from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      user?:IUser;
      client?:IClient
    }
  }
}

export {};