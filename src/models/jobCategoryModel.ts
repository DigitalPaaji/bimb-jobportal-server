import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  title: string;
  slug: string;
  subcat: mongoose.Types.ObjectId[];
  jobs: mongoose.Types.ObjectId[];
}

const categorySchema = new Schema<ICategory>(
  {
    title: {
      type: String,
      required: [true, "Category title is required"],
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

    subcat: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
      },
    ],

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

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export default Category;

