import express from 'express';
import path from 'path';
import {createUploadDirs} from '../utils/createDirs.mjs';
import uploadRoutes from './upload-handler.mjs';
import { fileURLToPath } from 'url';
import connectdb from '../config/mongodb.mjs';
import File from '../models/file.mjs';

connectdb();

const app = express();

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

app.listen(port, ()=>{
    console.log(`Server running at http:localhost:${port}`);
})