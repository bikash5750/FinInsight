import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import ConnectDB from "./src/DB_Connection/Connection.js";
dotenv.config({path:"./.env"});
const app = express();
app.use(express.json());
app.use(cors());


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

        app.listen(process.env.PORT,(req,res)=>{
            console.log(`Connect to server ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(`Server Error`,error)
    }
}
StartServer();

