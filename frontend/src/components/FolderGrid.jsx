import {Card} from "@/components/ui/card";

const FolderGrid = ({ folders=[], selected, onSelect }) => {  
  
    return(
       <div className="p-2 px-0">
        <h1 className="text-left text-zinc-500">Folders</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {folders.map((folderName) => (
          <Card
            key={folderName}
            onClick={() => onSelect(folderName)}
            className={`p-4 rounded cursor-pointer text-center transition-all duration-200
         ${selected === folderName
        ? 'bg-blue-600 text-white'
        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
          >
            {folderName}
           
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FolderGrid;
