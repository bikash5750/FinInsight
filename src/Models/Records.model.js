import mongoose from "mongoose";
import { Users } from "./User.model.js";

const RecordSchema = new mongoose.Schema({

    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref:Users,
        required:true,
        index:true,

    },
    amount:{
        type: Number,
        required:true,
        min:[1,"Amount cannot be less then 1"]
    },

    type:{
        type:String,
        required:true,
        enum:["income","expanse"],
        index: true

    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
    

},{timestamps:true});


export const Records = mongoose.model("Records",RecordSchema);