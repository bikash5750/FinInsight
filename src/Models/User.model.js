import mongoose from "mongoose";
import bcrypt from "bcrypt"
import mongoosePaginate from "mongoose-paginate-v2";


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



userschema.pre("save" ,async function(){
    try {

        if(!this.isModified("password")) return 
        this.password= await bcrypt.hash(this.password,10)
        

    } catch (error) {
        console.log(`Unable to HASH password`,error)
    }
})

userschema.methods.checkPassword = async function(password){
    return await bcrypt.compare(password,this.password)
}


userschema.plugin(mongoosePaginate)
export const Users = mongoose.model("Users",userschema) 