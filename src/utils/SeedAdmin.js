import mongoose from "mongoose";
import { Users } from "../Models/User.model.js";

//role based access(pre populating data)
 async function CreateAdmin(){
    try {
        await Users.deleteMany({ role: 'admin' })

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
        process.exit(0);

    } catch (error) {
        console.error('Seed failed:', error.message)
        process.exit(1)
    }
}

export default CreateAdmin;