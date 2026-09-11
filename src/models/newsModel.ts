import mongoose, { Document, Model, Schema } from "mongoose";

export interface INews extends Document {
  featuredImage: string;
  title: string;
  slug: string;
  description: string;
  publicationDate: Date;
  rejected:Boolean;
  homepage:Boolean;

   category:string | null;

}

const newsSchema = new Schema<INews>(
  { 
    featuredImage: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    rejected:{
      type:Boolean,
      default:false
    },
 
  homepage:{
type:Boolean,
default:false
    },
    publicationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    category: {
      type: String,
      
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const News: Model<INews> =
  mongoose.models.News ||
  mongoose.model<INews>("News", newsSchema);