import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {detectFileType, allowedMimeTypes} from "../utils/detectFileType.mjs"
import fs from "fs/promises";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination:  (req,file,cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req,file,cb) => {
        cb(null,Date.now() + '-' +file.originalname);
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
            await fs.unlink(uploadedFilePath); //dlt file if not allowed
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
      await fs.rename(uploadedFilePath, newPath);

      res.status(200).json({
        message: "File uploaded successfully",
        filePath: newPath,
      });

    } catch (err) {
        console.error("Error during upload:", err);
        res.status(400).json({error: err.message});
    }
  });

export default router;