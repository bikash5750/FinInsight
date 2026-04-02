import mongoose from "mongoose";

const userschema = new mongoose.Schema({
     name :{
        type:String,
        required:[true,"Name is required"],
        trim:true,
        lowercase:true,
    },
    username:{
        type:String,
        unique:true,
        required:[true,"Username is required"],
        trim:true,
        minlength:4,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        lowercase:true,
        unique:true,
        trim:true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      required:[true,"PassWord is required"],
    },
    role: {
      type: String,
      required:true,
      enum: ["viewer", "analyst", "admin"],
      default: "viewer",
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active"
    }

},{timestamps:true})

export const User = mongoose.model("Users",userschema) 