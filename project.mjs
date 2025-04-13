import dotenv from 'dotenv';
dotenv.config();

console.log("From test file:", process.env.MONGODB_URI);
