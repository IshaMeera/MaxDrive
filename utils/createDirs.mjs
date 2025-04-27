import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createUploadDirs(){
    const uploadDir = path.join(__dirname, '../uploads');

    const dirs = ['pdf','images','archives','documents','excel','videos','csv','others'];

    for(const dir of dirs){
        const dirPath = path.join(uploadDir, dir);
        try{
            await fs.mkdir(dirPath, {recursive: true});
            console.log(`Directory created: ${dirPath}`);
        }catch(err){
            console.error(`Error creating directory: ${dir}:`, err.message);
        }
    }
}