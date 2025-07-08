import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from 'react-toastify';

const UploadForm = ({
    fileInputRef, currentFolderId, fileName, BASE_URL}) => {
    const navigate = useNavigate();

    return(
        <form 
            onSubmit={async(e)=>{
                e.preventDefault();
                const file = fileInputRef.current.files[0];
                if(!file){
                    toast.error("Please select a file to upload");
                    return;
                }
                console.log('Uploading to folder:', currentFolderId);

                const formData =new FormData();
                formData.append('myFile', file);

                if(currentFolderId && currentFolderId !== 'undefined'){
                    formData.append('customFolder', currentFolderId);
                }
                try{
                    const response = await fetch(`${BASE_URL}/api/uploads`, {
                        method: 'POST',
                        body: formData,
                        credentials: "include"
                    })

                    const result = await response.json();
                    if(response.ok){
                        toast.success('File uploaded successfully!');
                        navigate('dashboard');
                    }else{
                        toast.error('An error occurred during uplaod.');
                        console.error('Upload error:', result.message);
                    }
                }catch(err){
                    console.error('Upload error:', err);
                }
            }} 
            className="flex flex-col items-center space-y-4"
            >
                <input
                ref={fileInputRef}
                id='fileInput'
                type='file'
                name='myFile'
                className="hidden"
                />
                {fileName && (
                    <p className="mt-2 text-sm text-blue-400 font-medium">{fileName}</p>
                )}
                <Button
                    type='submit'
                    className='w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200'
                >
                    Upload
                </Button>
            </form>
    )
}

export default UploadForm;