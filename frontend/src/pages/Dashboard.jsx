import React, { useState, useEffect, use } from 'react';
import SideBar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import FolderGrid from '@/components/FolderGrid';
import FileGrid from '@/components/FileGrid'; 
import FileViewer from '@/components/FileViewer';
import {BASE_URL} from '@/lib/config';
import FolderDialog from '@/components/FolderDialog';
import CustomFolderGrid from '@/components/CustomFolderGrid';
import useFileManager from '@/hooks/useFileManager';

const Dashboard = () => {
  const [folders, setFolders] = useState([]);
  const [showCreateFolderModel, setShowCreateFolderModel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); 
  const [customFolders, setCustomFolders] = useState([]);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [filter, setFilter] = useState('all');
  const {files, categoriesWithFiles, filteredFiles} = useFileManager(filter);
  //   ()=>{
  //   try{
  //   const saved = localStorage.getItem('filter');
  //   return saved ? JSON.parse(saved):'all';
  //   }catch{
  //     return 'all';
  //   }
  //  });

  // useEffect(()=>{
  //   if(filter){
  //     localStorage.setItem('selectedFilter', JSON.stringify(filter));
  //   }
  // }, [filter]);

  const searchedFiles = filteredFiles.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFilterChange = (newFilter)=>{
    setFilter(newFilter.toLowerCase().trim());
  };

  const refetchFolders = async () => {
    try{
    const res = await fetch(`${BASE_URL}/api/folders`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    setFolders(data);

    // if(data.length > 0){
    //   setFilter(data[0]);
    // }
    }catch(err){
      console.error('Error fetching folders:', err);
      }
   };

   useEffect(() =>{
    refetchFolders();
   }, []);

  useEffect(()=>{
    const fetchCustomFolder = async()=>{
      try{
        const res = await fetch(`${BASE_URL}/api/folders`);
        const data = await res.json();
        setCustomFolders(data); //array
      }catch(err){
        console.error('Failed to fetch folders', err);
      }
    }
    fetchCustomFolder();
  }, []);
   
  const handleCreateFolder = async() =>{
    if(!folderName.trim()) return;

    try{
      const res = await fetch(`${BASE_URL}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({name: folderName}),
      })

      const newFolder = await res.json();
      setCustomFolders((prev) => [...prev, newFolder]);
      setFolderName("");
      setShowFolderDialog(false);
    }catch(err){
      console.error('Failed to create folder', err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
   <Topbar showSearch searchTerm={searchTerm} onSearchChange={setSearchTerm}/>

    <div className='flex flex-1'>
    
   <SideBar onCreateFolder={() => setShowCreateFolderModel(true)} 
               onFilterChange={handleFilterChange}
               setShowFolderDialog={setShowFolderDialog}/>

   <main className="flex-1 p-0">
        <div className="p-2">
        {customFolders.length > 0 && (
          <>
          <CustomFolderGrid
            folders={customFolders}
            selected={filter}
            onSelect={setFilter}
            />
          </>
        )
        }
            <FolderGrid 
              folders={categoriesWithFiles.map(type => ({name: type}))}
              selected={filter?.name || filter}
              onSelect={(type) => setFilter(type)}
            />

        </div>
    <FileGrid filter={filter} searchTerm = {searchTerm} onFileClick={(file) => { 
       setSelectedFile(file)}}
      />

    {selectedFile && (<FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
       )}

    <FolderDialog 
      folderName={folderName}
      setFolderName={setFolderName}
      onCreate={handleCreateFolder}
      open={showFolderDialog}
      setOpen={setShowFolderDialog}
      />  
      </main>
    </div>
    </div>
  );
};

export default Dashboard;