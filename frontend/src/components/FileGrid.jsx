import React, {useRef, useState, useEffect} from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/lib/config";
import  EmptyFolder from "@/assets/EmptyFolder.svg?react";
import { Image, Video, FileText, FileArchive, File, FileSpreadsheet } from "lucide-react";
import useFileManager from "@/hooks/useFileManager";

const FileGrid = ({filter = "", searchTerm = "", onFileClick })=>{
  const clickTimeout = useRef(null);
  const linkRefs = useRef({});

  const{files, handleStar, handleTrash, loading, error} = useFileManager(filter);

  const [contextMenu, setContextMenu] = useState({visible: false, x:0, y:0, file: null,});
  useEffect(() => {
    const handleClickOutside = (e) => {
      if(!e.target.closest('.custom-context-menu')){
      setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const adjustedX = Math.min(contextMenu.x, window.innerWidth - 300);
  const adjustedY = Math.min(contextMenu.y, window.innerHeight - 200);

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
  const searchedFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filesWithPreview = searchedFiles.map((file) =>{
  const extenstion = file.filename.split('.').pop().toLowerCase();
//   console.log("🧪 Building preview for:", {
//   filename: file.filename,
//   folder: file.folder,
//   url: `${BASE_URL}/uploads/${file.folder}/${file.filename}`
// });

return {
    ...file,
    mimetype: mimeTypes[extenstion] || 'application/octet-stream',
    url: `${BASE_URL}/uploads/${file.folder}/${file.filename}`
   }  
  });
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <Image className="w-4 h-4 text-blue-400 mr-2" />;
    case 'pdf':
    case 'txt':
    case 'docx':
      return <FileText className="w-4 h-4 text-gray-400 mr-2" />;
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4 text-green-500 mr-2" />;
    case 'zip':
      return <FileArchive className="w-4 h-4 text-orange-400 mr-2" />;
    case 'mp4':
      return <Video className="w-4 h-4 text-purple-400 mr-2" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground mr-2" />;
  }
};
    return (
        <div>
        <h1 className="font-bold mb-6 text-blue-800 p-2 rounded shadow-md">
          Files in:{' '}
          <span className="capitalize text-primary">
            {typeof filter === 'string'?filter : filter?.name || "Untitled"}
          </span>
        </h1>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground">
            <EmptyFolder className="w-40 h-40 mb-4 opacity-70"/>
            <p className="text-lg font-medium">No files here yet</p>
            <p className="text-sm text-muted-foreground">Upload your first file to get started.</p>
          </div>
           ) : (
          <div className="relative">
          <ScrollArea className="h-[80vh] pr-2">
            <div className="flex items-center justify-between px-10 py-1 text-sm text-muted-foreground font-zinc-400">
            <div className="truncate max-w-[70%]">Name</div>
            <div className="pl-4">Size</div>
            </div>
            
            <div className="flex flex-col gap-1">
            {filesWithPreview.length === 0 && (
              <p className="text-gray-500 text-sm">No files to display</p>
              )}
              {filesWithPreview.map((file) => {
                if (!linkRefs.current[file._id]) {
                linkRefs.current[file._id] = React.createRef();
                console.log("Current filter in FileGrid:", filter);
console.log("Renderin files:", file.filename);
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
                    console.log('Right click detected', file);
                    setContextMenu({
                      visible: true,
                      x: e.pageX,
                      y: e.pageY,
                      file,
                    })
                  }}
                  className="px-1 py-1 bg-card text-card-foreground 
                  shadow-sm hover:bg-muted transition-colors duration-150 hover:bg-blue-200 cursor-pointer"
                >
                    <div className='flex items-center justify-between px-4 py-1'>
                    <div className="truncate text-sm text-black font-medium max-w-[70%]">
                        <div className="flex items-center space-x-2 text-sm text-black font-medium">
                          {getFileIcon(file.filename)}
                          <span>{file.filename}</span>
                        </div>
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
           {contextMenu.visible && contextMenu.file && (
            <div
              className="absolute custom-context-menu bg-white z-50 p-2 rounded-xl border shadow-lg w-48 transition-all animate-fade-in"
              style={{ top: adjustedY, left: adjustedX }}
            >
              <p onClick={()=>{ handleStar(contextMenu.file._id);
                console.log("Starred:", contextMenu.file.filename);
                setContextMenu({...contextMenu, visible: false});
              }}
              className="text-sm px-3 py-2 hover:bg-blue-100 rounded-md cursor-pointer transition">
                Star
              </p>
              <p onClick={() => { handleTrash(contextMenu.file._id);  
                  console.log("Trashed:", contextMenu.file.filename);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
                className="text-sm px-3 py-2 hover:bg-red-100 rounded-md cursor-pointer transition"
              >
                 Trash
              </p>
            </div>
          )}

          </div>
          )}
        </div>
    )
}

export default FileGrid;