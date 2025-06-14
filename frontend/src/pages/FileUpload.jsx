import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import uploadIcon from '../assets/upload.png';
import Topbar from '@/components/Topbar';
import { BASE_URL } from '@/lib/config';

const FileUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? `Selected File: ${file.name}` : '');
  };

  return (

    <div className="min-h-screen bg-black flex flex-col">
        <Topbar />
      <Card className="flex flex-1 justify-center w-full w-lg bg-zinc-900 text-white shadow-xl p-14 rounded-lg position-center mx-auto my-10">
        <CardHeader className="text-center">
          
          <CardTitle className="text-2xl font-bold">Upload Your File</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <img src={uploadIcon} alt="Upload" className="mx-auto h-16 mb-4" />

          <div>
            <p className="text-center text-gray-500">Drag & Drop your file </p>
            <p className="text-center text-gray-500 my-1">or</p>
            <Button type = "button" className='w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200' onClick={handleBrowseClick}>
              Browse
            </Button>
          </div>
          


          <form
            action={`${BASE_URL}/api/uploads`}
            method="post"
            encType="multipart/form-data"
            className="flex flex-col items-center space-y-4"
          >
           {/* <div className="text-center text-white border border-blue-500 rounded-lg p-0"> */}
            
            <input
              ref={fileInputRef}
              id="fileInput"
              type="file"
              name="myFile"
              onChange={handleFileChange}
              className='hidden'
            />
            {fileName && (
              <p className="mt-2 text-sm text-blue-400 font-medium">{fileName}</p>
            )}
          {/* </div> */}

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
              Upload
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
