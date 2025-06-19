import React from "react";
import  FolderIcon from "@/assets/FolderIcon.svg?react";


const CustomFolderGrid = ({folders = [], selected, onSelect})=>{
    if(!folders || folders.length === 0) return null;

    return(
        <div className="px-0">
            <h1 className="text-left text-zinc-500">Your Folders</h1>
            <div className="grid grid-cols-2sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) =>(
                    <div
                     key={folder._id}
                     className={`flex flex-col items-center cursor-pointer hover:opacity-80 transition ${
                        selected === folder.name.toLowerCase() ? "opacity-100" : "opacity-60"
                     }`}
                     onClick={() => onSelect(folder.name.toLowerCase())}
                    >
                      
                    <FolderIcon className="w-12 h-12 text-yellow-400"/>
                    <p className="text-sm mt-0 text-center text-black">{folder.name}</p>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default CustomFolderGrid;