import React from 'react'
import { Plus, Star, Trash2, Clock, FolderSearch } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'

const SideBar = ({onCreateFolder, onFilterChange, setShowFolderDialog})=>{
  const navigate = useNavigate();

  const actions = [
    {label: "New Folder", icon: <Plus />, onClick: () => setShowFolderDialog(true)},
    {label: "Starred", icon: <Star />, onClick: () =>  onFilterChange("Starred")},
    {label: "Trash", icon: <Trash2 />, onClick: () => onFilterChange("Trashed")},
    {label: "Recent", icon: <Clock />, onClick: () => onFilterChange('Recent Files')},
    {label: "All Files", icon: <FolderSearch />, onClick:() => onFilterChange('all')}
];
 return(
   <div className="p-1 space-y-3">
      <h2 className="text-base font-semibold text-white mb-3">Quick Actions</h2>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Card
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-2 p-2 cursor-pointer bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition-all duration-200 rounded"
          >
            {action.icon}
            <span className="font-medium">{action.label}</span>
          </Card>
        ))}
      </div>
    </div>
 )
}

export default SideBar;
