import express from "express"
import Auth from "../Auth/Auth.middleware.js"
import { CreateRecords ,UpdateRecords ,DeleteRecords ,ViewAllRecords ,GetRecordsById} from "../Controllers/Records.Controllers.js"




const Recordrouter = express.Router();

Recordrouter.post("/create",Auth,CreateRecords);
Recordrouter.patch("/update",Auth,UpdateRecords);
Recordrouter.delete("/delete",Auth,DeleteRecords);
Recordrouter.get("/viewall",Auth,ViewAllRecords);
Recordrouter.get("/getrecordbyid",Auth,GetRecordsById)

//console.log(`i am in record route`);
export {Recordrouter};