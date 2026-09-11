import mongoose, { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string | null;
  phone?: string | null;
  image?: string | null;
  status: boolean;
  lastLoginAt?: Date | null;
  gender?: "male" | "female" | "other" | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  resume?: string | null;
  jobappled: mongoose.Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [200, "Email cannot exceed 200 characters"],
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"],
      default: null,
    },

    image: {
      type: String,
      trim: true,
      maxlength: [500, "Image URL cannot exceed 500 characters"],
      default: null,
    },

    status: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      default: null,
    },
    resume:{
      type:String,
      default:null
    },
    jobappled: {
  type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  default: [ ],
      },

    
  




  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", UserSchema);

export default User;