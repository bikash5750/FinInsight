import express from "express"
import { CreateUser , SetStatusInactive ,SetStatusActive,DeleteUser,UpdateUserDetails} from "../Controllers/Admin.Controller.js";
import Auth from "../Auth/Auth.middleware.js";

const Adminrouter = express.Router();


Adminrouter.post("/create-user", Auth, CreateUser);
Adminrouter.patch("/setstatusinactive",Auth,SetStatusInactive);
Adminrouter.patch("/setstatusactive",Auth,SetStatusActive);
Adminrouter.delete("/deleteuser",Auth,DeleteUser);
Adminrouter.patch("/updateuserdetails",Auth,UpdateUserDetails)


export {Adminrouter}