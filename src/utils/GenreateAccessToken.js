import jwt from "jsonwebtoken";

export default function GenreateAccessToken(user){
    try {
       return  jwt.sign(
        {
            id:user.id,
            email:user.email,
            role:user.role,
            status:user.status,
        },
        process.env.ACCESS_SECRET,
        {
            expiresIn:'30m',
        }
       )
        
    } catch (error) {
       console.log(`Error while creating JWT`,error) 
    }

}

