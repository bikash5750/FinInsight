import {UserDataValidator, LoginValidator} from "../Validators/UserData.Validator.js";
import {  Users } from "../Models/User.model.js";
import GenreateAccessToken from "../utils/GenreateAccessToken.js"


const LoginUser = async (req,res)=>{
    try {

        const {email ,password} =req.body;

        if( !email || !password){
           return  res.status(400).json({message:"Required fields are missing"});
        }    
        

        const userlogintvalidator = LoginValidator.safeParse(req.body)
        if(!userlogintvalidator.success){
            const message = userlogintvalidator.error.errors[0].message;

            return res.status(400).json({ message });
        }


        const userfound = await Users.findOne({email})
        if(!userfound){
            return res.status(404).json({message:"User not Found"})
        }

        const ispasswordcorrect = await userfound.checkPassword(password)
        if(!ispasswordcorrect){
            return res.status(401).json({message:"Incorrect Password"})
        }


        if(userfound.status !== 'active'){
             return res.status(403).json({
                message: "User is inactive"
            });
        }


        const accesstoken = GenreateAccessToken(userfound)

        res.cookie("accesstoken",accesstoken,{
            httpOnly: true,
            secure: true,
        })
        
        console.log(accesstoken);

        return res.status(200).json({
            message:"Login Succesfull",
            name:userfound.name,
            email:userfound.email,
            status:userfound.status,
            role:userfound.role
        })
    } catch (error) {
        res.status(505).json({message : "Server Error Unable to Login"})
    }
}





const CreateUser = async (req,res)=>{
    try {

        console.log(req.user);
        if(req.user.role !== 'admin'){
            return res.status(403).json({
                message: "Only admin can create users"
            });
        }

        const {name,username,email,password,role,status} = req.body;

        if(!name || !username || !email || !password || !role || !status){
            return res.status(400).json({
            message: "Required fields are missing"
            });
        }

        if(role === 'admin'){
            return res.status(400).json({
                message: "Cannot create admin"
            })
        }

        const userdeatilsvalidation = UserDataValidator.safeParse(req.body);

        if(!userdeatilsvalidation.success){
            const message = userdeatilsvalidation.error.errors[0].message;
            return res.status(400).json({ message });
        }


        const user = await Users.CreateUser({
            name,
            username,
            email,
            password,
            role,
            status: "active"
        })

        res.status(201).json({
            message: "User created successfully",
            user
        });


    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}





export {CreateUser,LoginUser}