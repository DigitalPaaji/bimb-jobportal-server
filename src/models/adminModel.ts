import { model, Schema } from "mongoose";

export interface IAdmin extends Document{
name:string;
email:string;
password:string;
sessionId:string | null;
isActive:Boolean;
lastLogin:Date
}


const AdminSchema = new Schema<IAdmin>({

 name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

  password: {
      type: String,
      required: true,
      select: false,
    },
sessionId: {
      type: String,
      default: null,
    },
 isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
},{timestamps:true})


export const Admin = model<IAdmin>("Admin", AdminSchema);