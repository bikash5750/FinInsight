import express from "express"
import { CreateUser } from "../Controllers/Admin.Controller.js";
import Auth from "../Auth/Auth.middleware.js";

const Adminrouter = express.Router();


Adminrouter.post("/create-user", Auth, CreateUser);

export {Adminrouter}