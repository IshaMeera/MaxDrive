import React from "react";
import  FolderIcon from "@/assets/FolderIcon.svg?react";


const CustomFolderGrid = ({folders = [], selected, onSelect,
        renamingFolderId, setRenamingFolderId, newFolderName, setNewFolderName, handleRename
})=>{
    if(!folders || folders.length === 0) return null;

    return(
        <div className="px-0">
            <h1 className="text-left text-zinc-500">Your Folders</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) =>{
                    if(!folder || !folder.name) return null;
                    return(
                    <div
                     key={folder._id}
                     className={`flex flex-col items-center cursor-pointer hover:opacity-80 transition ${
                        selected === folder.name.toLowerCase() ? "opacity-100" : "opacity-60"
                     }`}
                     >
                    <div
                     onClick={() => onSelect(folder.name.toLowerCase())}
                     className="flex flex-col items-center"
                    >   
                    <FolderIcon className="w-12 h-12 text-yellow-400"/>
                    {/* <p className="text-sm mt-0 text-center text-black">{folder.name}</p> */}
                    </div>

                    <div 
                    onClick={(e)=>{
                        e.stopPropagation();
                        setRenamingFolderId(folder._id);
                        setNewFolderName(folder.name);
                    }}
                    >
                        {renamingFolderId === folder._id ? (
                            <input 
                              autoFocus
                              type="text"
                              value={newFolderName}
                              onChange={(e)=> setNewFolderName(e.target.value)}
                              onBlur={()=>handleRename(folder._id)}
                              onKeyDown={(e)=>{
                                if(e.key === 'Enter') handleRename(folder._id);
                              }}
                              className="text-sm mt-0 text-center border-gray px-2 bg-white text-black w-28"
                                />
                        ) : (
                            <p className="text-sm mt-0 text-center text-black">{folder.name}</p>
                        )} 
              
            </div>
        </div>
                    )
                })}
                </div>
                </div>
            
    )
}

export default CustomFolderGrid;