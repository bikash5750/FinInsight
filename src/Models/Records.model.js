import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
    

},{timestamps:true});


export const Records = mongoose.model("Records",RecordSchema);