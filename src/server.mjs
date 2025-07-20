import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import filesRoutes from './routes/files.mjs';
import folderRoutes from './routes/folders.mjs';
import {createUploadDirs} from '../utils/createDirs.mjs';
import uploadRoutes from './upload-handler.mjs';
import connectdb from '../config/mongodb.mjs';

connectdb();

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== 'production';

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get('/download/:folder/:filename', (req,res)=>{
  const filePath = path.join(__dirname, 'uploads', req.params.folder, req.params.filename);

  res.download(filePath, req.params.filename, (err)=>{
    if(err){
      console.error('Download error:', err);
      return res.status(404).send('File not found.');
    }
  })
})

app.use(cors({
  origin: isDev ? 'http://localhost:5173' : undefined,
  credentials: isDev?true:false,
})); // Enable CORS for all routes
// This allows the frontend to make requests to the backend without CORS issues
console.log("isDev:", isDev);

createUploadDirs(); // upload dir creation during server start

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // secure: false, //true if using https
    httpOnly: true,
    maxAge: 1000*60*60*24,
    sameSite: 'lax'
  }
}))

app.use("/api", uploadRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/folders', folderRoutes);

app.use(express.static(path.join(__dirname,'../public')));  

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(port, ()=>{
    console.log(`Server running at http:localhost:${port}`);
})
