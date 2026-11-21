import { Schema, model, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ICandidateSelect extends Document {
  clientId: Types.ObjectId;
  applicationID: Types.ObjectId;
   status: "new" | "contected" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}



const CandidateSelectSchema = new Schema<ICandidateSelect>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
     
    applicationID:{
        type: Schema.Types.ObjectId,
       ref: "Application",
      required: true,
      index: true, 
    },
    status:{
        type:String,
        enum:["new","contected","rejected"]
    }



  },
  {
    timestamps: true,
  }
);



export const CandidateSelect = model<ICandidateSelect>(
  "CandidateSelect",
  CandidateSelectSchema
);

