import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import ConnectDB from "./src/DBConnection/Connection.js";
import { Adminrouter } from "./src/Routes/Admin.Routes.js";
import { Authrouter } from "./src/Routes/Auth.Routes.js";
import CreateAdmin from "./src/utils/SeedAdmin.js"



dotenv.config({path:"./.env"});
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());



app.use("/api/auth", Authrouter);
app.use("/api/admin", Adminrouter);

app.get("/env",(req,res)=>{
    try {
        res.send("connected to dotenvfile")
    } catch (error) {
        console.log(`unable to connect with dotenv`,error)
    }
    
})

const StartServer = async ()=>{
    try {
        await ConnectDB();
        CreateAdmin();

        app.listen(process.env.PORT,(req,res)=>{
            console.log(`Connect to server ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(`Server Error`,error)
    }
}
StartServer();

