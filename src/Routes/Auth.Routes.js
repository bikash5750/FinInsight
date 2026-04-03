import express from "express"
import { LoginUser,CreateUser } from "../Controllers/Admin.Controller.js";


const Authrouter = express.Router();


Authrouter.post("/login" , LoginUser);

export {Authrouter}