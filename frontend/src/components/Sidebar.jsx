import React from 'react'
import { Plus, Star, Trash2, Clock, FolderSearch } from 'lucide-react'  
import { TbFolderPlus } from "react-icons/tb";
import { MdOutlineUploadFile } from "react-icons/md";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const SideBar = ({ onFilterChange, onCreateFolder, handleUploadToFolder, currentFolder})=>{

  const actions = [
    {label: "New", icon: <Plus size={30}/>},
    {label: "Starred", icon: <Star size={18}/>, onClick: () =>  onFilterChange("Starred")},
    {label: "Trash", icon: <Trash2 size={18}/>, onClick: () => onFilterChange("Trashed")},
    {label: "Recent", icon: <Clock size={18}/>, onClick: () => onFilterChange('Recent Files')},
    {label: "All Files", icon: <FolderSearch size={18}/>, onClick:() => onFilterChange('all')}
];
 return (
    <div className="p-4 text-gray-800 w-56">
      <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
      <nav className="flex flex-col gap-1">
        {actions.map((action) => (
          action.label === "New" ? (
            <DropdownMenu key="New">
               <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-1 rounded-lg py-2 hover:bg-zinc-700/50 hover:translate-x-1 transition-all duration-200 group w-full">
                  <span className="text-gray-800 group-hover:text-white transition-colors">{action.icon}</span>
                  <span className="text-sm font-medium group-hover:text-white">{action.label}</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="dropdown-menu-content w-48">
                <DropdownMenuItem onClick={onCreateFolder}>
                  <TbFolderPlus size={16} className="mr-1" />
                  New Folder
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => handleUploadToFolder(
                    currentFolder 
                      ? { _id: currentFolder._id, name: currentFolder.name} 
                      : null
               )}>
                  <MdOutlineUploadFile size={16} className="mr-3 h-4 w-4 opacity-50" />
                    File Upload {currentFolder?.name ? `${currentFolder.name}` : "Root"}
                </DropdownMenuItem> 
              </DropdownMenuContent>
           </DropdownMenu>
          ) : (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-700/50 hover:translate-x-1 transition-all duration-200 group"
          >
            <span className="text-gray-800 group-hover:text-white transition-colors">{action.icon}</span>
            <span className="text-sm font-medium group-hover:text-white">{action.label}</span>
          </button>
          )
        ))}
      </nav>
    </div>
  );
};

export default SideBar;
