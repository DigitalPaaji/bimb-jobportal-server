import { Schema, model, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface IApplication extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;


  resume: string;

  coverLetter?: string;

  
  answers?: {
    question: string;
    answer: string;
  }[];

  status: ApplicationStatus;

  recruiterNote?: string;

 
  interview?: {
    date?: Date;
    mode?: "ONLINE" | "OFFLINE";
    meetingLink?: string;
    location?: string;
    note?: string;
  };

  // Important application timestamps
  appliedAt: Date;
  shortlistedAt?: Date;
  interviewedAt?: Date;
  selectedAt?: Date;
  rejectedAt?: Date;
  withdrawnAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    resume: {
      type: String,
      required: true,
      trim: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    answers: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },

        answer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
      index: true,
    },

    recruiterNote: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    interview: {
      date: {
        type: Date,
      },

      mode: {
        type: String,
        enum: ["ONLINE", "OFFLINE"],
      },

      meetingLink: {
        type: String,
        trim: true,
      },

      location: {
        type: String,
        trim: true,
      },

      note: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    shortlistedAt: {
      type: Date,
    },

    interviewedAt: {
      type: Date,
    },

    selectedAt: {
      type: Date,
    },

    rejectedAt: {
      type: Date,
    },

    withdrawnAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


ApplicationSchema.index(
  { userId: 1, jobId: 1 },
  { unique: true }
);

/**
 * Useful for admin/recruiter:
 * Get applications for a particular job sorted by newest.
 */
ApplicationSchema.index({
  jobId: 1,
  createdAt: -1,
});

/**
 * Useful for candidate:
 * Get all applications submitted by a user.
 */
ApplicationSchema.index({
  userId: 1,
  createdAt: -1,
});

export const Application = model<IApplication>(
  "Application",
  ApplicationSchema
);

