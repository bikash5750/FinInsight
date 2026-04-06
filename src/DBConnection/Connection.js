import mongoose from "mongoose";

const ConnectDB = async () => {
    try {
        //console.log(process.env.MONGO_URL)
        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Database connection failed ", error);
        process.exit(1); 
    }
};

export default ConnectDB;