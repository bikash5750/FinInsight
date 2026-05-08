import zod from "zod"


const name = ()=>{
    console.log(`hello bikash`)
}

name()
const UserDataValidator = zod.object({
    name:zod.string()
    .min(3,"Name must be of atleast 3 length")
    .max(25,"Name must be of 25 len at max")
    .trim(),

    username:zod.string()
    .min(4,"Username should be of more then 4 len")
    .max(20,"Username must be of 20 le at max")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

    email:zod.string()
    .email("Email Formate Invalid"),

    password:zod.string()
    .min(6,"Minlength of the password must be 6")
    .max(20,"Password cannot be of more then 20 len")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),

    role: zod.enum(["viewer", "analyst", "admin"])

})


const LoginValidator = zod.object({
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(3, "Password is required wrong password provided")
});



const UpdateUserValidator = zod.object({
    email: zod.string().email("Invalid email"),

    name: zod.string().min(3).max(25).optional(),
    username: zod.string().min(4).max(20).optional(),
    password:zod.string()
    .min(6,"Minlength of the password must be 6")
    .max(20,"Password cannot be of more then 20 len")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")
    .optional(),

    status: zod.string().optional()
});



export  {LoginValidator,UserDataValidator,UpdateUserValidator}