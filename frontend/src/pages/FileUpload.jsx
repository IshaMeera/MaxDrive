import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import uploadIcon from '../assets/upload.png';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Topbar from '@/components/Topbar';
import { BASE_URL } from '@/lib/config';
import { toast } from 'react-toastify';
import { useCustomFolders } from '@/context/CustomFolderContext';
import { useSearchParams, useLocation } from 'react-router-dom';

const FileUpload = () => {
  const {customFolders, setCustomFolders} = useCustomFolders();
  // const [searchParams] = useSearchParams();
  // const location = useLocation();
  const [currentFolderId, setCurrentFolderId] = useState('');
  // const folderId = searchParams.get('folderId');

  // console.log("🧪 folderId param:", searchParams.get("folderId"));
//   console.log("🔍 Raw searchParams:", searchParams.toString());
//   useEffect(() => {
//   const folderId = searchParams.get('folderId');
//   console.log("✅ Folder ID inside useEffect:", folderId);
//   if (folderId) {
//     setCurrentFolderId(folderId);
//   }
// }, [location.search]);

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
      const res = await fetch(`${BASE_URL}/api/folders`);
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
      <Card className="flex flex-1 justify-center w-full w-lg bg-zinc-900 text-white shadow-xl p-14 rounded-lg position-center mx-auto my-10">
        <CardHeader className="text-center">
          
          <CardTitle className="text-2xl font-bold">Upload Your File</CardTitle>
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
        
          <form
            onSubmit={async (e) =>{
              e.preventDefault();
              const file = fileInputRef.current.files[0];
              if(!file) {
                toast.error("Please select a file to upload.")
                return;
              }

              console.log('Uploading to folder:', currentFolderId);

              const formData = new FormData();
              formData.append('myFile', file);

              if(currentFolderId && currentFolderId !== 'undefined'){
                formData.append('customFolder', currentFolderId)
              }

              try{
                const response = await fetch(`${BASE_URL}/api/uploads`, {
                  method: 'POST',
                  body: formData,
                });
        
                const result = await response.json();
                if(response.ok){
                toast.success('File uploaded successfully!');
                navigate('/dashboard');
                }else{
                  toast.error("An error occurred during upload.");
                  console.error('Upload error:', result.message);
                }
              }catch(err){
                console.error('Upload error:', err);
                alert('Upload failed. Please try again.');
              }
            }}
            className='flex flex-col items-center space-y-4'
            >
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

            <Button type="summit" 
            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
              Upload
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
