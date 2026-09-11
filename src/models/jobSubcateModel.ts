import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubCategory extends Document {
  title: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  jobs: mongoose.Types.ObjectId[];
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Category title cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    category: 
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },


    jobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Subcategory: Model<ISubCategory> =
  mongoose.models.Subcategory ||
  mongoose.model<ISubCategory>("Subcategory", SubCategorySchema);

export default Subcategory;

