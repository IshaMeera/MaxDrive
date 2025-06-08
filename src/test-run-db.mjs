import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log("Mongodb uri is:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("Connected to MONGODB");
        process.exit();
    })
    .catch((err)=>{
        console.log("Error connecting db", err.message);
        process.exit(1);
    })