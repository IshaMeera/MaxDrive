import React, { useState, useEffect } from 'react';
import SideBar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import FolderGrid from '@/components/FolderGrid';
import FileGrid from '@/components/FileGrid'; 
import FileViewer from '@/components/FileViewer';
import FolderDialog from '@/components/FolderDialog';
import CustomFolderGrid from '@/components/CustomFolderGrid';
import {BASE_URL} from '@/lib/config';
import useFileManager from '@/hooks/useFileManager';
import { useCustomFolders } from '@/context/CustomFolderContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const navigate = useNavigate();

  const {customFolders, setCustomFolders} = useCustomFolders();
  const [folders, setFolders] = useState([]);
  const [showCreateFolderModel, setShowCreateFolderModel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); 
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [filter, setFilter] = useState('all');
  const [stableFolders, setStableFolders] = useState([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const {filteredFiles, autoFolders, rawFiles} = useFileManager(filter);
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
        body: JSON.stringify({name: folderName.trim()}),
      })
      if(res.status === 409){
        setShowDuplicateDialog(true);
        return;
      }
      if(!res.ok) throw new Error('Failed to create folder');

      const newFolder = await res.json();
      setCustomFolders((prev) => [...prev, newFolder]);
      setFolderName("");
      setShowFolderDialog(false);
    }catch(err){
      console.error('Failed to create folder', err);
    }
  }
  // console.log("Auto folders in Dashboard:", autoFolders);
  useEffect(()=>{
    if(!showFolderDialog){
      setFolderName('');
    }
  },[showFolderDialog]);

  const handleRename = async (folderId) => {
    const trimmedName = newFolderName.trim();
    if(!trimmedName) return;

    try{
      const res = await fetch(`${BASE_URL}/api/folders/${folderId}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: trimmedName}),
      });
      if(res.status === 409){
        setShowDuplicateDialog(true);
      }
      if(!res.ok) throw new Error('Rename failed');

      const updated = await res.json();
      setCustomFolders((prev)=>
          prev.map((folder)=>
            folder._id === folderId ? {...folder, name:updated.name}:folder
    ))
    setRenamingFolderId(null);
    setNewFolderName('');
    }catch(err){
      console.error('Failed to rename folder:', err);
    }
  }
  
  useEffect(()=>{
    if(!showDuplicateDialog){
      setNewFolderName('');
      setRenamingFolderId(null);
    }
  },[showDuplicateDialog]);

  useEffect(() => {
    const folderSet = new Set();
    rawFiles
        .filter(file => !file.isTrashed)
        .forEach(file => {
          const folder = file.folder?.toLowerCase();
          if(folder && autoFolders.includes(folder)){
            folderSet.add(folder);
          }
        });
        const newFolders = Array.from(folderSet);
        //  console.log("⏳ Recalculating folders from raw files:", newFolders);

      // Prevent infinite loop by updating state only if it's actually different 
      const areEqual = stableFolders.length === newFolders.length &&
        stableFolders.every((f, i) => f === newFolders[i]);

      if (!areEqual) {
        setStableFolders(newFolders);
      }
  }, [rawFiles, autoFolders]);

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
            // onSelect={setFilter}
            renamingFolderId={renamingFolderId}
            setRenamingFolderId={setRenamingFolderId}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleRename={handleRename}
            onSelect={(folder)=>{
             setFilter({name:folder.name.toLowerCase(), _id:folder._id, type: 'custom'});
            }}
            />
          </>
        )
        }
            <FolderGrid 
              folders={stableFolders}
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
      showDuplicateDialog={showDuplicateDialog}
      setShowDuplicateDialog={setShowDuplicateDialog}
      />  

      </main>
    </div>
    </div>
  );
};

export default Dashboard;