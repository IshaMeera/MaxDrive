import {Card} from "@/components/ui/card";

const FolderGrid = ({ folders = [], selected, onSelect }) => {
  if (!folders || !Array.isArray(folders)) {
    return <div className="text-white">No folders provided</div>;            // Or show fallback UI latweee
  }
  if (folders.length === 0) {
    return <div className="text-white">Folder list is empty</div>;
  }
  // console.log('Folders is foldergrid', folders);
    return(
       <div className="p-2 px-0">
        <h1 className="text-left text-zinc-500">Folders</h1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {folders.map((folder) => (
          <Card
            key={folder._id || folder.name}
            onClick={() => onSelect(folder.name)}
            className={`p-4 rounded cursor-pointer text-center transition-all duration-200
      ${typeof selected === 'object' && selected?._id === folder._id
        ? 'bg-blue-600 text-white'
        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
          >
            {folder.name || "Untitled"}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FolderGrid;
