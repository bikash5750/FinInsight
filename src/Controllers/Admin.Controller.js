import {UserDataValidator, LoginValidator ,UpdateUserValidator} from "../Validators/UserData.Validator.js";
import {  Users } from "../Models/User.model.js";
import GenreateAccessToken from "../utils/GenreateAccessToken.js"


const LoginUser = async (req,res)=>{
    try {

        const {email , password} =req.body;

        if( !email || !password){
           return  res.status(400).json({message:"Required fields are missing"});
        }    
        

        const userlogintvalidator = LoginValidator.safeParse(req.body)
        if(!userlogintvalidator.success){
            const message = userlogintvalidator.error.issues[0].message;

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
            secure: false,
        })
        
        //console.log(accesstoken);

        return res.status(200).json({
            message:"Login Succesfull",
            name:userfound.name,
            email:userfound.email,
            status:userfound.status,
            role:userfound.role
        })
    } catch (error) {
        console.log(error)
        res.status(505).json({message : "Server Error Unable to Login"})
    }
}




const CreateUser = async (req,res)=>{
    try {

        //console.log(req.user);
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
                message: "Cannot create admin created explicitly"
            })
        }

        const userdeatilsvalidation = UserDataValidator.safeParse(req.body);

        if(!userdeatilsvalidation.success){
            const message = userdeatilsvalidation.error.issues[0].message;
            return res.status(400).json({ message });
        }


        const user = await Users.create({
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




const SetStatusInactive = async (req,res) => {

    try {

        if(req.user.role !== 'admin'){
            return res.status(403).json({
                message: "Only admin can change status of  users"
            });
        }

        const {email} = req.body;
        
        if(!email){
            return res.status(400).json({message:'Required field are Missing'})
        }


        const findemail = await Users.findOne({email});
        if(!findemail){
            return res.status(404).json({message:'User Not Found'})
        }

        if(findemail.status === "inactive"){
            return res.status(200).json({message:"user satatus is already inactive"})
        }

        findemail.status = "inactive";
        await findemail.save();

        return res.status(200).json({message:"User Status set to INACIVE"})
    } catch (error) {
        console.log(`error in setstatusinactive`,error)

        return res.status(500).json({message:" server error unable to set status to inactive"})
        
    }
    
}





const SetStatusActive = async (req,res) => {

    try {

        if(req.user.role !== 'admin'){
            return res.status(403).json({
                message: "Only admin can change status of  users"
            });
        }

        const {email} = req.body;
        
        if(!email){
            return res.status(400).json({message:'Required field are Missing'})
        }


        const findemail = await Users.findOne({email});
        if(!findemail){
            return res.status(404).json({message:'User Not Found'})
        }

        if(findemail.status === "active"){
            return res.status(200).json({message:"user satatus is already Active"})
        }

        findemail.status = "active";
        await findemail.save();

        console.log(findemail)

        return res.status(200).json({message:"User Status set to ACTIVE"})
    } catch (error) {
        console.log(`error in setstatusinactive`,error)

        return res.status(500).json({message:" server error unable to set status to Active"})
        
    }
    
}




const DeleteUser = async (req,res) => {

    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({
                message: "Only admin can change DELETE of users"
            });
        }

        const {email} = req.body;
        
        if(!email){
            return res.status(400).json({message:'Required field are Missing'})
        }


        const deletedUser = await Users.findOneAndDelete({ email });

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted permanently",
            user: deletedUser   
        });



    } catch (error) {
        console.log("Error deleting user:", error);

        return res.status(500).json({
            message: "Server error"
        });
        
    }
    
}




const UpdateUserDetails = async (req,res)=>{
    try {
         if(req.user.role !== 'admin'){
            return res.status(403).json({
                message: "Only admin can change DELETE of users"
            });
        }

       const { email, name, username, role , password,status } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const validateuserdata = UpdateUserValidator.safeParse(req.body)

        if(!validateuserdata.success){
            const message = validateuserdata.error.issues[0].message;
            return res.status(404).json({message})
        }


        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (username) user.username = username;
        if(role) user.role = role;
        if (status) user.status = status;
        if (password) {
            user.password = password;
        }

        await user.save();
        return res.status(200).json({
            message: "User updated successfully",
            user:user
        });


        
    } catch (error) {
         console.log("Error updating user:", error);

        return res.status(500).json({
            message: "Server error while updating data"
        });
        
    }
}




const GetAllUsers = async (req,res)=>{
    try {

       if (req.user.role !== "admin" && req.user.role !== "analyst"){
        return res.status(403).json({message : "you are not Autorized to get all userdetails"})
       }

        const users = await Users.find(
            { role: { $in: ["analyst", "viewer"] } }, 
            "name email status username"             
        );

         return res.status(200).json({
            message: "Users fetched successfully",
            users
        });
        
        
    } catch (error) {
        console.log("Error fetching users:", error);

        return res.status(500).json({
            message: "Server error unable to fetch user"})
        
    }
}



export {CreateUser,LoginUser,SetStatusInactive,SetStatusActive,DeleteUser,UpdateUserDetails,GetAllUsers}