import mongoose from "mongoose";
import { Users } from "../Models/User.model.js";

//role based access(pre populating data)
console.log("Seeding started...")
async function CreateAdmin(){
    try {
        
        const adminexist = await Users.find({
         email: { $in: ["gbikash5750@gmail.com", "rohit51@gmail.com"] }
        });

        if (adminexist.length === 2) {
            console.log(" Admin already exists");
             return;
            }
        await Users.create([
            {
              name: 'bikash gupta',
              username:'bikash50',
              email: 'gbikash5750@gmail.com',
              password: 'Ssg@@1964',
              role: 'admin',
              status: 'active',
            },
            {
                name: 'rohit kumar',
                username: 'rohit51',
                email: 'rohit51@gmail.com',
                password: 'Ssg@@1964',
                role: 'admin',
                status: 'active'

            }
        ])

        console.log(`Admin created Sucessfully`)

    } catch (error) {
        console.error('Seed failed:', error.message)
        process.exit(1)
    }
}


export default CreateAdmin
