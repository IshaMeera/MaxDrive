import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {detectFileType, allowedMimeTypes} from "../utils/detectFileType.mjs"
import fsPromises from "fs/promises";  //for promise async fs functions
import fs from "fs"; //for sync fs functions
import File from "../models/file.mjs";
import mongoose from "mongoose";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(process.cwd(), "uploads");


const storage = multer.diskStorage({
    destination:  (req,file,cb) => {
        cb(null, uploadDir);
        console.log('Upload directory path:', uploadDir);
    },
    filename: async (req, file, cb) => {
  try {
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    let filename = `${baseName}${ext}`;
    let counter = 1;

    const subdirs = await fsPromises.readdir(uploadDir, { withFileTypes: true });

    const fileExists = async (name) => {
      
      const rootPath = path.join(uploadDir, name);
      try {
        await fsPromises.access(rootPath);
        return true;
      } catch (_) {
        // Not found in root, continue
      }

      // Check in subfolders
      for (const dirent of subdirs) {
        if (dirent.isDirectory()) {
          const subPath = path.join(uploadDir, dirent.name, name);
          try {
            await fsPromises.access(subPath);
            return true;
          } catch (_) {
            // Not found in this subfolder
          }
        }
      }

      return false;
    };

    while (await fileExists(filename)) {
      filename = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, filename);
  } catch (error) {
    console.error("Filename generation error:", error);
    cb(error);
  }
}
});

const upload = multer({storage});

//file detection 
/** 
* @route POST /api/uploads
* @request {multipart/form-data} file - The uploaded file
* @response {json} File info or error message
*/

router.post("/uploads", upload.single("myFile"), async (req, res) => {
    if(!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
    
    const uploadedFilePath = path.join(req.file.destination, req.file.filename);
    console.log("Uploaded file path:", uploadedFilePath);

    let detectedMimeType = '';
    let ext = '';

    try {  
      const result = await detectFileType(uploadedFilePath);
      detectedMimeType = result.detectedMimeType;
      ext = result.ext;

      console.log("Detected MIME type:", detectedMimeType);
      console.log("Detected file extension:", ext);

      if(!allowedMimeTypes.includes(detectedMimeType)){
            await fsPromises.unlink(uploadedFilePath); //dlt file if not allowed
            return res.status(400).json({error: "Unsupported or unknown file type"})
      }

      let targetFolder = '';
      
        switch(ext){
            case 'pdf':
                targetFolder = 'pdf';
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
                targetFolder = 'images';
                break;
            case 'docx':
            case 'txt':
                targetFolder = 'documents';
                break;
            case 'mp4':
                targetFolder = 'videos';
                break;
            case 'zip':
                targetFolder = 'zips';
                break;
            case 'csv':
                targetFolder = 'csv';
                break;
           default:
                targetFolder = 'others';
        }

      const newPath = path.join(req.file.destination, targetFolder, req.file.filename);
      console.log('Moving file to:', newPath);

      await fsPromises.mkdir(path.join(req.file.destination, targetFolder), {recursive: true});
      await fsPromises.rename(uploadedFilePath, newPath);

      console.log('Incoming upload req.body:', req.body);

      const isValidCustomFolder = mongoose.Types.ObjectId.isValid(req.body.customFolder);

      const savedFile = new File({
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadDate: new Date(),
        physicalFolder: targetFolder || 'others',  //field tat saves files to pdf,img,etc
        folder: null,
        customFolder: isValidCustomFolder ? req.body.customFolder : null,
        sessionID: req.sessionID,
      });
      await savedFile.save();

    //   console.log("Saving file to DB with:", {
    //   filename: req.file.filename,
    //   physicalFolder: targetFolder,
    // });

      res.status(200).json({
        message: "File uploaded successfully",
        filePath: newPath,
        dbEntry: savedFile,
      });

    } catch (err) {
        console.error("Error during upload:", err);
        res.status(400).json({error: err.message});
    }
  });

export default router;