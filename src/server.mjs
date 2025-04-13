import express from 'express';
import path from 'path';
import upload from './upload-handler.mjs';
import { fileURLToPath } from 'url';
import connectdb from '../config/mongodb.mjs';
import File from '../models/file.mjs';

connectdb();

const app = express();

const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname,'../public')));

app.post('/uploads', upload.single('myFile'), async(req,res) => {
    console.log('POST /uploads route hit');
    if(!req.file) return res.status(400).send('No file uploaded');

    try{
        const savedFile = await File.create({
            filename: req.file.filename,
            size: req.file.size
        });
        console.log('Saved file to DB: ', savedFile);
        res.send({message: "Upload Successful!", file: req.file.filename});
    }catch(err){
        console.log('Error saving to DB: ', err);
        res.status(500).send('Upload failed');
    }
    
});

app.listen(port, ()=>{
    console.log(`Server running at http:localhost:${port}`);
})