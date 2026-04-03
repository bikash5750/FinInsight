import jwt from "jsonwebtoken";
import { Users } from "../Models/User.model.js";

const Auth = async function(req,res,next) {
    try {

        const token = req.cookies.accesstoken;

        if(!token){
            return res.status(401).json({message:"No Access Token Found"});
        }

        const decode = jwt.verify(token,process.env.ACCESS_SECRET);

        const user = await Users.findById(decode.id);
        if(!user){
           return res.status(404).json({message:"No User Found"})
        }

        if (user.status !== "active") {
            return res.status(403).json({
                message: "User is inactive"
            });
        }

        req.user = user;
        next();

        
    } catch (error) {
        return res.status(401).json({ message: "Invalid Access token ot Token Expired" });
    }
    
}

export default Auth;

