import jwt from "jsonwebtoken";
import { Users } from "../Models/User.model.js";
import redisclient from "../utils/Redis.js";

const Auth = async function(req,res,next) {
    try {

        const token = req.cookies.accesstoken;

        if(!token){
            return res.status(401).json({message:"No Access Token Found"});
        }

        const decode = jwt.verify(token,process.env.ACCESS_SECRET);

        //console.log(decode)
        const user = await Users.findById(decode.id);
        // console.log(`user is` , user)
        if(!user){
           return res.status(404).json({message:"No User Found"})
        }

        const result = await redisclient.exists(`token:${token}`)

        if (result) {
            return res.status(401).json({
              message: "Session expired, please login again"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                message: "User is inactive"
            });
        }

        req.user = user;
        next();

        
    } catch (error) {
        console.log(`error while auth the user`,error.message)
        return res.status(401).json({ message: "Invalid Access token ot Token Expired" });
    }
    
}

export default Auth;

