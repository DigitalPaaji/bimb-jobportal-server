import mongoose, { Schema, model, Document } from "mongoose";



const ContentSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: null,
    },

    des: {
      type: String,
      trim: true,
      default: null,
    },

    color: {
      type: String,
      trim: true,
      default: null,
    },

    image: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    _id: true,
  }
);


export interface IArticle extends Document {


  title: string;
  slug: string;

  shortDescription?: string | null;

  content: {
    title?: string | null;
    des?: string | null;
    color?: string | null;
    image?: string | null;
  }[];

  thumbnail?: string | null;

  category?: string | null;

  tags: string[];
homepage:Boolean;
  status: "DRAFT" | "PUBLISHED";


  views: number;

  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {

    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
      default: null,
    },

 

    content: {
      type: [ContentSchema],
      default: [],
    },

  

    thumbnail: {
      type: String,
      trim: true,
      default: null,
    },

  

    category: {
      type: String,
      trim: true,
    
      default: null,
      index: true,
    },



    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) =>
        tags
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
    },



    status: {
      type: String,
      enum: {
        values: ["DRAFT", "PUBLISHED"],
        message: "Invalid article status",
      },
      default: "PUBLISHED",
      index: true,
    },



 
   homepage:{
type:Boolean,
default:false
    },

    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);








const Article = model<IArticle>(
  "Article",
  ArticleSchema
);

export default Article;