import { Schema, model, Document, Types } from "mongoose";


export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";

export type WorkMode =
  | "ONSITE"
  | "REMOTE"
  | "HYBRID";

export type JobStatus =
  | "DRAFT"
  | "PENDING"
  | "PUBLISHED"
  | "CLOSED"
  | "REJECTED"
  | "EXPIRED";




export interface IJob extends Document {
  title: string;

  slug: string;

  description: string;

  companyName: string;

  companyLogo: string | null;

  companyWebsite?: string;

  location: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };

  jobType: JobType;

  workMode: WorkMode;

  category: Types.ObjectId;
  subcategory: Types.ObjectId;

  skills: string[];

  experience: {
    min: number;
    max?: number;
  };

  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: "YEARLY" | "MONTHLY" | "WEEKLY" | "HOURLY";
  };

  education?: string[];

  responsibilities?: string[];
  questions?: string[];

  requirements?: string[];

  benefits?: string[];

  vacancies: number;

  applicationDeadline?: Date;

  applicationUrl?: string;

  contactEmail?: string;

  contactPhone?: string;



  status: JobStatus;

  isFeatured: boolean;

  isUrgent: boolean;

  views: number;

  applicationsCount: number;

  createdAt: Date;

  updatedAt: Date;
}




const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 150,
    },

    companyLogo: {
      type: String,
      default:null,
      trim: true,
    },

    companyWebsite: {
      type: String,
      trim: true,
    },

    location: {
      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
      },

      address: {
        type: String,
        trim: true,
      },
    },

    jobType: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "FREELANCE",
      ],
      required: [true, "Job type is required"],
    },

    workMode: {
      type: String,
      enum: ["ONSITE", "REMOTE", "HYBRID"],
      required: [true, "Work mode is required"],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Job category is required"],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },

      max: {
        type: Number,
        min: 0,
      },
    },

    salary: {
      min: {
        type: Number,
        min: 0,
      },

      max: {
        type: Number,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
        uppercase: true,
      },

      period: {
        type: String,
        enum: ["YEARLY", "MONTHLY", "WEEKLY", "HOURLY"],
        default: "YEARLY",
      },
    },

    education: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: [String],
      default: [],
    },
    questions: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    benefits: {
      type: [String],
      default: [],
    },

    vacancies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    applicationDeadline: {
      type: Date,
    },

    applicationUrl: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

   

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "PUBLISHED",
        "CLOSED",
        "REJECTED",
        "EXPIRED",
      ],
      default: "DRAFT",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isUrgent: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);




JobSchema.index({
  title: "text",
  description: "text",
  companyName: "text",
  skills: "text",
});

JobSchema.index({
  status: 1,
  createdAt: -1,
});

JobSchema.index({
  category: 1,
  status: 1,
});

JobSchema.index({
  "location.city": 1,
  status: 1,
});

JobSchema.index({
  jobType: 1,
  workMode: 1,
});

JobSchema.index({
  isFeatured: 1,
  status: 1,
});




export const Job = model<IJob>("Job", JobSchema);   

