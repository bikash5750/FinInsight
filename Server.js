import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import redisclient from "./src/utils/Redis.js";
import ConnectDB from "./src/DBConnection/Connection.js";
import { Adminrouter } from "./src/Routes/Admin.Routes.js";
import { Authrouter } from "./src/Routes/Auth.Routes.js";
import { Recordrouter } from "./src/Routes/Records.Routes.js";
import DashboardRouter from "./src/Routes/DaashBoard.Routes.js";
import {Ratelimiter} from "./src/utils/RateLimiter.js";




dotenv.config({path:"./.env"});
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true
}));
app.use(Ratelimiter)





app.use("/api/auth", Authrouter);
app.use("/api/admin", Adminrouter);
app.use("/api/records",Recordrouter);
app.use("/api/dashboard",DashboardRouter);

const StartServer = async ()=>{
    try {
        // await ConnectDB();
        // await redisclient.connect(); connecting it parallely using promise

        await  Promise.all([ConnectDB(),redisclient.connect()])
        console.log(`connect to redis`)

        app.listen(process.env.PORT,(req,res)=>{
            console.log(`Connect to server ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(`Server Error`,error)
    }
}
StartServer();

