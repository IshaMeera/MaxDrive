import express from 'express';
import path from 'path';
import {createUploadDirs} from '../utils/createDirs.mjs';
import uploadRoutes from './upload-handler.mjs';
import { fileURLToPath } from 'url';
import connectdb from '../config/mongodb.mjs';
import File from '../models/file.mjs';
import cors from 'cors';
import dotenv from 'dotenv';
import filesRoutes from './routes/files.mjs';
import folderRoutes from './routes/folders.mjs';

dotenv.config();
connectdb();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
app.use(cors()); // Enable CORS for all routes
// This allows the frontend to make requests to the backend without CORS issues

createUploadDirs(); // upload dir creation during server start

app.use(express.json());
app.use("/api", uploadRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/folders', folderRoutes);

app.use(express.static(path.join(__dirname,'../public')));  

app.get('/api/folders', async(req, res) =>{
    try{
        const folders = await File.distinct('folder');
        res.json(folders);    
    }catch(err){
        console.error('Error fetching folders', err);
        res.status(500).send('Server error');
    }
})
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(port, ()=>{
    console.log(`Server running at http:localhost:${port}`);
})
