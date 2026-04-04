import express from "express"
import Auth from "../Auth/Auth.middleware.js"
import { CreateRecords ,UpdateRecords ,DeleteRecords ,ViewAllRecords ,GetRecordsById} from "../Controllers/Records.Controllers.js"



const Recordrouter = express.Router();

Recordrouter.post("/createrecord",Auth,CreateRecords);
Recordrouter.patch("/updaterecords",Auth,UpdateRecords);
Recordrouter.patch("/deleterecords",Auth,DeleteRecords);
Recordrouter.get("/viewrecords",Auth,ViewAllRecords);
Recordrouter.get("/getrecordbyid",Auth,GetRecordsById)


export {Recordrouter};