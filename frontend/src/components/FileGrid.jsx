import React, {useRef, useState, useEffect} from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/lib/config";
import  EmptyFolder from "@/assets/EmptyFolder.svg?react";
import { Image, Video, FileText, FileArchive, File, FileSpreadsheet} from "lucide-react";
import useFileManager from "@/hooks/useFileManager";
import {FaStar, FaRegStar} from 'react-icons/fa';
import ContextMenu from "./ContextMenu";
import { FaFilePdf, FaFileArchive, FaFileExcel, FaFileAlt } from 'react-icons/fa';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


const FileGrid = ({filter = "", searchTerm = "", onFileClick, viewMode = 'table', setViewMode = '' })=>{
  const clickTimeout = useRef(null);
  const linkRefs = useRef({});
  const{files, handleStar, handleTrash, handleRestore, handleDeletePermanent, setRawFiles, setAllFiles, setFilteredFiles, loading, error} = useFileManager(filter);
  
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [newFileName, setNewFileName] = useState('');
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
  const isTrashView = filter === 'trash' || filter === 'trashed' ||
                      (typeof filter === 'string' && (filter.name === 'trash' || filter.name === 'trashed')) ||
                      (typeof filter === 'object' && (filter.name === 'trash' || filter.name === 'trashed'));

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
const extDisplayMap = {
      jpg: "JPG File",
      jpeg: "JPEG File",
      png: "PNG File",
      mp4: "MP4 Video",
      txt: "Text File",
      csv: "CSV File",
      pdf: "PDF File",
      docx: "Word Document",
      xlsx: "Excel File",
      zip: "ZIP Archive",
}
  const searchedFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filesWithPreview = searchedFiles.map((file) =>{
  const extenstion = file.filename.split('.').pop().toLowerCase();
return {
    ...file,
    extenstion,
    extLabel: extDisplayMap[extenstion] || `${extenstion.toUpperCase()} File`,
    nameWithoutExt: file.filename.replace(`.${extenstion}`, ''),
    mimetype: mimeTypes[extenstion] || 'application/octet-stream',
    url: `${BASE_URL}/uploads/${file.physicalFolder}/${file.filename}`
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

    if(files.length === 0) {
      return(
          <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground">
            <EmptyFolder className="w-40 h-40 mb-4 opacity-70"/>
            <p className="text-lg font-medium">No files here yet</p>
            <p className="text-sm text-muted-foreground">Upload your first file to get started.</p>
          </div>
    );
  }

    return (
      <div>
        <div className="flex justify-between items-center mb-6 p-2 rounded shadow-md bg-white">
        <div className="flex items-center gap-2">
        {/* <span className="font-bold text-blue-800">Files in:</span> */}
          <span className="capitalize text-primary font-medium">
            {typeof filter === 'string' ? filter: filter?.name || 'Untitled'}
            </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='text-sm'>
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={()=>setViewMode('table')}>
              List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>setViewMode('preview')}>
              Preview
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        
        {viewMode === 'table' ? (
          <>
          <div className="relative">
          <ScrollArea className="h-[80vh] pr-2">
            <div className="grid grid-cols-4 gap-4 px-6 py-2 text-sm font-zinc-400 text-muted-foreground border-b text-left">
            <div className="text-right pr-50">Name</div>
            <div>Type</div>
            <div>Date Modified</div>
            <div className="pl-4 text-right">Size</div>
            </div>
            
            <div className="flex flex-col gap-1">
            {filesWithPreview.length === 0 && (
              <p className="text-gray-500 text-sm">No files to display</p>
              )}
              {filesWithPreview.map((file) => {
                if (!linkRefs.current[file._id]) {
                linkRefs.current[file._id] = React.createRef();
                console.log("Current filter in FileGrid:", filter);
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
                    // console.log('Right click detected:', e.pageX, e.pageY);
                    //console.log('Right click detected:', file);
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
            {!isTrashView && (file.isStarred ? (
                 <FaStar
                  size={18}
                  className="text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors duration-200 ease-in-out" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStar(file._id);
                  }}
                  />
             ) : (
                  <FaRegStar
                  size={18}
                  className="text-zinc-400 cursor-pointer hover:text-yellow-300 transition-colors duration-200 ease-in-out"
                  onClick={(e) => {
                    e.stopPropagation();  
                    handleStar(file._id);
                  }}
                  />
                )
              )}
              {getFileIcon(file.filename)}  
             <div className="grid grid-cols-4 gap-4 items-center w-full">
                    <div>
                      {renamingFileId === file._id ? (
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              const finalName = `${newFileName.trim()}.${file.extenstion}`;

                              try {
                                const response = await fetch(`${BASE_URL}/api/files/${file._id}/rename`, {
                                  method: 'PATCH',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify({ newName: finalName }),
                                  credentials: "include"
                                });

                                const result = await response.json();
                                
                                const updateItemById = (list, id, updates) =>
                                list.map((item) =>
                                  item._id === id ? { ...item, ...updates } : item
                                );
                                if (response.ok) {
                                  const updatedFields = {
                                  filename: finalName,
                                  nameWithoutExt: newFileName.trim(),
                                };
                                  setAllFiles((prev) => updateItemById(prev, file._id, { filename: finalName }));
                                  setRawFiles((prev) => updateItemById(prev, file._id, updatedFields));
                                  setFilteredFiles((prev) => updateItemById(prev, file._id, updatedFields));
                                  console.log("🔁 Renamed file immediately:", updatedFields);
                                }else{
                                  console.error('Rename failed:', result)
                                }
                              } catch (error) {
                                console.error('Rename error:', error);
                              } finally {
                                setRenamingFileId(null);
                              }
                            } 
                            if (e.key === 'Escape') {
                              setRenamingFileId(null);
                            }
                          }}
                          className="text-sm bg-white text-black border border-gray-300 px-2 py-0.5 w-full"
                          autoFocus
                        />
                      ) : (
                        <span
                        className="block truncate max-w-[100px] sm:max-w-[120px] md:max-w-[160px]"
                        title={file.nameWithoutExt}
                        >

                          {file.nameWithoutExt}</span>
                      )}
                      </div>
                      <div className="text-xs text-muted-foreground">{file.extLabel}</div>
                    <div className="text-xs text-muted-foreground">{new Date(file.uploadDate).toLocaleString()}</div> 

                        </div>
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
                    <div className="text-xs text-muted-foreground ">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    </div>
                </Card>
              )
            })}
            </div>
          </ScrollArea>
          <ContextMenu 
              file={contextMenu.file}
              x={contextMenu.x}
              y={contextMenu.y}
              visible={contextMenu.visible}
              onClose={() => setContextMenu({...contextMenu, visible: false})}
              inTrashView={filter === 'trashed'}
              filter={filter}
              handleStar={handleStar}
              handleTrash={handleTrash}
              handleRestore={handleRestore}
              handleDeletePermanent={handleDeletePermanent}
              onRename={(file)=>{
                setRenamingFileId(file._id);
                setNewFileName(file.nameWithoutExt);
              }}
          />
          </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filesWithPreview.map((file)=>(
              <div key={file._id} className="relative group flex flex-col items-center justify-center p-2 rounded overflow-hidden hover:bg-zinc-700 cursor-pointer transition">
                {file.mimetype.startsWith('image/')&& (
                  <img src={file.url} alt={file.filename} className="w-full h-32 object-cover rounded group-hover:scale-105 transition"/>
                )}
                {file.mimetype.startsWith('video/') &&(
                  <video src={file.url} className="w-full h-32 object-cover rounded transition-transform duration-300 group-hover:scale-105"
                  controls  
                  muted
                  autoPlay
                  loop
                  />
                )}
                {/* Icons for other types epcept vdo or img */}
            {!file.mimetype.startsWith("image/") &&
              !file.mimetype.startsWith("video/") && (
                <div className="h-32 flex items-center justify-center">
                  {file.mimetype.includes("pdf") && (
                    <FaFilePdf size={48} className="text-red-400" />
                  )}
                  {file.mimetype.includes("zip") && (
                    <FaFileArchive siz
                    Icons for other types epcept vdo or imge={48} className="text-yellow-400" />
                  )}
                  {(file.mimetype.includes("excel") ||
                    file.mimetype.includes("spreadsheet")) && (
                    <FaFileExcel size={48} className="text-green-400" />
                  )}
                  {file.mimetype.startsWith("application/") &&
                    !file.mimetype.includes("pdf") &&
                    !file.mimetype.includes("zip") &&
                    !file.mimetype.includes("excel") && (
                      <FaFileAlt size={48} className="text-blue-400" />
                    )}
                    </div>
              )}
              <span className="mt-2 text-xs font-medium text-gray-300 break-all text-center">
                {file.nameWithoutExt}
              </span>
              </div>
            ))} 
            </div>
    )}      
        </div>
        
    )
}

export default FileGrid;