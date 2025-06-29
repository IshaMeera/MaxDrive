import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

const FileViewer = ({ file, onClose }) => {
    // const [content, setContent] = useState("");
    if(!file) return null;

    const {filename, url, mimetype} = file; 

    // console.log('Fileviewer received:', file); 

//     useEffect(()=>{
//         if (mimetype === "text/plain" || mimetype === "text/csv") {
//     fetch(file.url)
//       .then(res => {
//         if (!res.ok) throw new Error("Failed to load content.");
//         return res.text();
//       })
//       .then(setContent)
//       .catch(() => setContent("⚠️ Failed to load content."));
//   }
// }, [file]);

    const renderContent = () =>{
        if(!file || !file.mimetype || !file.url){
            return <p className="text-red-500"> Invalid file or missing preview data.</p>
        }
        console.log('Rendering content for:', file.filename);
        console.log('File mimeType:', file.mimetype);
        console.log('File URL', file.url);

        if(mimetype.startsWith("image/")){
            return <img src={file.url} alt={file.filename} className="max-h-[70vh] mx-auto rounded shadow"/>
        }
        if (mimetype === "application/pdf") {
             return <iframe src={file.url} className="w-full h-[70vh]" />;
        }

        if (mimetype === "text/plain" || mimetype === "text/csv") {
            return <iframe src={file.url} title={filename} className="w-full h-[70vh]" />;
        // return (
        //     <div className="bg-zinc-900 text-white p-4 rounded shadow max-h-[70vh] overflow-auto">
        //     <pre className="whitespace-pre-wrap">{content}</pre>
        //     </div>
        // );
        }

        if (mimetype === "video/mp4") {
      return (
        <video controls className="w-full max-h-[70vh] rounded">
          <source src={file.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
     }

     return(
        <div className="text-center">
            <p className="mb-4 text-muted-foreground">Preview not supported for this file type.</p>
            <Button variant="secondary" onClick={() => window.open(url, "_black")}>
                Download {filename}
            </Button>

        </div>
     )
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl' aria-describedby='file-preview-description'>
                <DialogHeader>
                    <DialogTitle className='turncate'>{file.filename}</DialogTitle>
                    <DialogDescription id='file-preview-description' className="sr-only">
                        Preview of selected file
                    </DialogDescription>
                </DialogHeader>
            <div className="mt-2">{renderContent()}</div>
            </DialogContent>

        </Dialog>
    )
}
export default FileViewer;