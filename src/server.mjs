import express from 'express';
import path from 'path';
import {createUploadDirs} from '../utils/createDirs.mjs';
import uploadRoutes from './upload-handler.mjs';
import { fileURLToPath } from 'url';
import connectdb from '../config/mongodb.mjs';
import File from '../models/file.mjs';
import cors from 'cors';

connectdb();

const app = express();
app.use(cors()); // Enable CORS for all routes
// This allows the frontend to make requests to the backend without CORS issues

createUploadDirs(); // upload dir creation during server start

app.use(express.json());
app.use("/api", uploadRoutes);

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname,'../public')));

app.get('/files', async(req, res) => {
    try{
        const files = await File.find().sort({uploadDate: -1});
        res.json(files);
    }catch(err){
        console.log('Error fetching files: ', err);
        res.status(500).send('Server error');
    }
})

app.get('/api/files/', async(req, res) =>{
    try{
        const {type} = req.query;

        let query = {};
        if(type){
            query = {folder: type};
        }
        const files = await File.find(query).sort({uploadDate: -1});
        res.json(files);
    }catch(err){
        console.error('Error fetching files', err);
        res.status(500).send('Server error');
    }
})

app.get('/api/folders', async(req, res) =>{
    try{
        const folders = await File.distinct('folder');
        res.json(folders);    
    }catch(err){
        console.error('Error fetching folders', err);
        res.status(500).send('Server error');
    }
})

app.listen(port, ()=>{
    console.log(`Server running at http:localhost:${port}`);
})