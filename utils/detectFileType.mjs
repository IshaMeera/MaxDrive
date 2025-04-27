import fs from 'fs/promises';
import path from 'path';
import {fileTypeFromBuffer} from 'file-type';

export const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'application/pdf',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', //excel
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', //word
    'text/plain',
    'video/mp4',
    'text/csv'
];

//jsdoc comment 
/**
 * @param {Object} file - Multer's file object (includes mimetype, path, originalname)
 * @returns {Promise<Object>} - Returns { ext, mime, source }
 */

export async function detectFileType(file){
   
  try{
         
    // //check1: mimetype 
    // if(allowedMimeTypes.includes(file.mimetype)){
    //     return{
    //         ext: file.originalname.split('.').pop(),
    //         mime: file.mimeType,
    //         source: 'mime',
    //     };
    // }

    // //check 2: fallback - use content detection
    const buffer = await fs.readFile(file);
    const detectedFile = await fileTypeFromBuffer(buffer);

    if(detectedFile){
        return {
            ext: detectedFile.ext,
            detectedMimeType: detectedFile.mime,
            // source: 'content',
        };
    }
    // const fileType = await fileTypeFromBuffer(buffer);

    // if (fileType) {
    //     return{
    //         detectedMimeType: fileType.mime,
    //         ext: fileType.ext,
    //     }
    // };

    
    //fallback: use extension if buffer detection fails

    const ext = path.extname(file).toLowerCase().slice(1);
    let detectedMimeType;

    switch(ext){
        case 'txt':
            detectedMimeType = 'text/plain';
            break;
        case 'jpg':
        case 'jpeg':
            detectedMimeType = 'image/jpeg';
            break;
        case 'png':
            detectedMimeType = 'image/png';
            break;
        case 'pdf':
            detectedMimeType = 'application/pdf';
            break;
        case 'docx':
            detectedMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        case 'xlsx':
            detectedMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
        case 'zip':
            detectedMimeType = 'application/zip';
            break;
        case 'mp4':
            detectedMimeType = 'video/mp4';
            break;
        case 'csv':
            detectedMimeType = 'text/csv';
            break;
        default:
            console.error("Unsupported file type:", ext);
            throw new Error('Unsupported or unknown file type sryy');
    }
    return {
        detectedMimeType,
        ext,
    };

    }catch(err){
        console.error("Errror in detectFileType:", err.message);
        throw new Error("File could not be detected. Please try again.");
    }
}
// throw new Error('Unsupported or unknown file type');
