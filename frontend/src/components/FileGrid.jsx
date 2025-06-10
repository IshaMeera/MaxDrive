import React, {useRef} from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/lib/config";
import  EmptyFolder from "@/assets/EmptyFolder.svg?react";

const FileGrid = ({files = [], filter = "", onFileClick})=>{
  const clickTimeout = useRef(null);
  const linkRefs = useRef({});

const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessi ngml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip',
      txt: 'text/plain',
      csv: 'text/csv',
      mp4: 'video/mp4'
    }

const filesWithPreview = files.map((file) =>{
const extenstion = file.filename.split('.').pop().toLowerCase();

return {
    ...file,
    mimetype: mimeTypes[extenstion] || 'application/octet-stream',
    url: `${BASE_URL}/uploads/${file.folder}/${file.filename}`
   }  
  });

    return (
        <div>
        <h1 className="font-bold mb-6 text-blue-800 p-2 rounded shadow-md">
          Files in:{' '}
          <span className="capitalize text-primary">{filter}</span>
        </h1>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground">
            <EmptyFolder className="w-40 h-40 mb-4 opacity-70"/>
            <p className="text-lg font-medium">No files here yet</p>
            <p className="text-sm text-muted-foreground">Upload your first file to get started.</p>
          </div>
           ) : (
          <ScrollArea className="h-[80vh] pr-2">
            <div className="flex flex-col gap-1">
              {filesWithPreview.map((file) => {
                if (!linkRefs.current[file._id]) {
                linkRefs.current[file._id] = React.createRef();
              }
              const handleClick = () => {
                clearTimeout(clickTimeout.current);
                clickTimeout.current = setTimeout(()=>{
                  onFileClick(file);
                },200);
              };

              const handleDoubleClick = () =>{
                clearTimeout(clickTimeout.current);
                linkRefs.current[file._id]?.current?.click();
              };
              const handleRightClick = (e) => {
                e.preventDefault();
                linkRefs.current[file._id]?.current?.click();
              };
              
              return(
                <Card 
                  key={file._id}
                  onClick={()=> onFileClick(file)}
                  onDoubleClick={()=> linkRefs.current[file._id]?.current?.click()}
                  onContextMenu={(e) =>{
                    e.preventDefault();
                    linkRefs.current[file._id]?.current?.click();
                  }}
                  className="px-1 py-1 bg-card text-card-foreground 
                  shadow-sm hover:bg-muted transition-colors duration-150 hover:bg-blue-200 cursor-pointer"
                >
                    <div className='flex items-center justify-between px-4 py-1'>
                    <div className="truncate text-sm text-black font-medium max-w-[70%]">
                        {file.filename} 
                      {/* Hidden anchor to trigger programmatically */}
                      <a 
                        href={file.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        ref={linkRefs.current[file._id]}
                        onClick={(e)=> e.stopPropagation()}
                        className="hidden"
                      >
                        Hidden link
                      </a>
                    </div>
                    <div className="text-sm text-muted-foreground flex-shrink-0 pl-4 bg-blue-100 text-blue-800 rounded-full px-2">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    </div>
                </Card>
              )
            })}
            </div>
          </ScrollArea>
          )}
        </div>
    )
}

export default FileGrid;