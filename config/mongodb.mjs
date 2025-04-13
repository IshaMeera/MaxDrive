import mongoose from "mongoose";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
dotenv.config({path: path.resolve(__dirname, '../.env')});

const connectdb = async() =>{
    try{
        const uri = process.env.MONGODB_URI;
        console.log("Connecting to: ", uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas');
    }catch(err){
        console.error('MongoDB connection error girl: ', err);
        process.exit(1);
    }
}

export default connectdb;