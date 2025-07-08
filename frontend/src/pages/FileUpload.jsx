import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import uploadIcon from '../assets/upload.png';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Topbar from '@/components/Topbar';
import { BASE_URL } from '@/lib/config';
import { useCustomFolders } from '@/context/CustomFolderContext';
import UploadForm from '@/components/UploadForm';

const FileUpload = () => {
  const {customFolders, setCustomFolders} = useCustomFolders();
  const [currentFolderId, setCurrentFolderId] = useState('');

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

  useEffect(() => {
  const fetchFolders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/folders`,{
        credentials: "include"
      });
      const data = await res.json();
      setCustomFolders(data);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    }
  };
  fetchFolders();
}, []);

  return (

    <div className="min-h-screen bg-black flex flex-col">
        <Topbar />
      {/* desktop */}
      <Card className="hidden sm:flex flex-1 justify-center w-full w-lg bg-zinc-900 text-white shadow-xl p-14 rounded-lg position-center mx-auto my-10">
        <CardHeader className="text-center">       
          <CardTitle className="text-xl sm:text-2xl font-bold">Upload Your File</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
           <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-white">Select Folder</label>
            <Select onValueChange={setCurrentFolderId} value={currentFolderId}>
              <SelectTrigger className="w-full bg-zinc-800 text-black border border-gray-300 text-white">
                <SelectValue placeholder="Choose custom folder" />
              </SelectTrigger>
              <SelectContent>
                {customFolders.map((folder) => (
                  <SelectItem key={folder._id} value={folder._id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <img src={uploadIcon} alt="Upload" className="mx-auto h-16 mb-4" />

          <div>
            <p className="text-center text-gray-500">Drag & Drop your file </p>
            <p className="text-center text-gray-500 my-1">or</p>
            <Button type = "button" className='w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200' onClick={handleBrowseClick}>
              Browse
            </Button>
          </div>
        
            <UploadForm
            fileInputRef={fileInputRef}
            currentFolderId={currentFolderId}
            fileName={fileName}
            BASE_URL={BASE_URL}
          />
            <input
              ref={fileInputRef}
              id="fileInput"
              type="file"
              name="myFile"
              onChange={handleFileChange}
              className='hidden'
            />
        
        </CardContent>
      </Card>
       {/* MOBILE view */}
      <div className="flex flex-col sm:hidden justify-center text-white p-10 mx-auto my-6 w-full bg-black rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-4">Upload Your File</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Folder</label>
          <Select onValueChange={setCurrentFolderId} value={currentFolderId}>
            <SelectTrigger className="w-full bg-zinc-800 text-white border border-gray-300">
              <SelectValue placeholder="Choose custom folder" />
            </SelectTrigger>
            <SelectContent>
              {customFolders.map((folder) => (
                <SelectItem key={folder._id} value={folder._id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <img src={uploadIcon} alt="Upload" className="mx-auto h-16 mb-4" />

        <div className="text-center text-gray-400 mb-4">
          <p>Drag & Drop your file</p>
          <p className="my-1">or</p>
        </div>

        <Button type="button" className='w-full mb-4 bg-blue-500 hover:bg-blue-600 transition-colors duration-200' onClick={handleBrowseClick}>
          Browse
        </Button>
            <UploadForm
            fileInputRef={fileInputRef}
            currentFolderId={currentFolderId}
            setCurrentFolderId={setCurrentFolderId}
            fileName={fileName}
            BASE_URL={BASE_URL}
          />

          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            name="myFile"
            onChange={handleFileChange}
            className='hidden'
          />
          
      </div>
        </div>
      );
    };

export default FileUpload;
