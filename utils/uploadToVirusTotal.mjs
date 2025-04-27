import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

//jsdox comment

/**
 * @param {string} filePath - The path to the file to be scanned. absolute path.
 * @returns {Promise<Object>} - Returns the response from VirusTotal API. Scan result.
 */

export async function uploadToVirusTotal(filePath){

        const form = new FormData();
        const fileBuffer = await fs.readFile(filePath);
        form.append('file', fileBuffer, {filename: 'file'});

        const url = 'https://www.virustotal.com/api/v3/files';

        const headers = {
                ...form.getHeaders(),
                'x-apikey': process.env.VIRUSTOTAL_API_KEY,
            };
        
        const res = await axios.post(url, form, {headers});
        return res.data.data.id;  //get the scan id
}