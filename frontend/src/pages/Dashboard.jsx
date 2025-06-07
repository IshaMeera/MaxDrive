import React, { useState, useEffect } from 'react';
import {Card,CardContent,CardHeader,CardTitle} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import SideBar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import FolderGrid from '@/components/FolderGrid';
import axios from 'axios';

const Dashboard = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [categoriesWithFiles, setCategoriesWithFiles] = useState([]);
  const [showCreateFolderModel, setShowCreateFolderModel] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = files.filter(file =>
  file.filename.toLowerCase().includes(searchTerm.toLowerCase())
);

  const handleFilterChange = (newFilter)=>{
    setFilter(newFilter.toLowerCase().trim());
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/folders')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFolders(data);
        if (data.length > 0) {
          setFilter(data[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching folders:', err);
      });
  }, []);

  useEffect(()=>{
    if(!filter) return;
    const controller = new AbortController();

    const fetchFiles = async()=>{ 
      
      // console.log('Raw filter:', filter);

      const normalizedFilter = filter?.toLowerCase().trim();
      // console.log('Normalized filter:', normalizedFilter);

      let url = 'http://localhost:3000/api/files';

      if (normalizedFilter === "starred") {
        url += '?starred=true';
      } else if (normalizedFilter === "trashed") {
        url += '?trash=true';
      } else if (normalizedFilter === "all" || normalizedFilter === "View all files"){
        //Do ntng, default will return all the non-trashed filter
      } else if (
        ["images", "pdf", "videos", "documents", "excel", "zips", "archives", "csv", "others"].includes(normalizedFilter)
      ) {
        url += `?type=${normalizedFilter}`;
      } else{
        console.log('Filter did not match any condition');
      }
      
      try{
        const response = await fetch(url, {signal: controller.signal});
        if(!response.ok) throw new Error('Failed tp fetch files');

        const data = await response.json();
  //        console.log('Filters:', filter);
  // console.log('Files:', files);
  // console.log('Fetching url:', url);
        setFiles(data);

        //update categories that contains files
        const catWithFiles = new Set();
        data.forEach((file)=>{
          if(file.type && typeof file.type === 'string'){
            catWithFiles.add(file.type.toLowerCase());
          }
        });
        setCategoriesWithFiles(Array.from(catWithFiles));
      }catch(err){
       if(err.name === 'AbortError'){
        console.log('Fetch aborted');
      }else{
        console.error('Fetch error:', err.message);
      }
    }
    }
    fetchFiles();

    return() => controller.abort();  //abort previous fetch if filters changes quicky
  },[filter]);


  return (
    <div className="flex flex-col min-h-screen">
  <Topbar showSearch searchTerm={searchTerm} onSearchChange={setSearchTerm}/>

    <div className='flex flex-1'>
      {/* Sidebar */}
   <SideBar onCreateFolder={() => setShowCreateFolderModel(true)} 
               onFilterChange={handleFilterChange}/>

      {/* Main Content */}
      <main className="flex-1 p-0">
        <div className="p-2">
        {Array.isArray(categoriesWithFiles) &&(

    <FolderGrid folders={folders} selected={filter} onSelect={setFilter} />
        )}
        </div>
        <h1 className="font-bold mb-6 text-blue-800 p-2 rounded shadow-md">
          Files in:{' '}
          <span className="capitalize text-primary">{filter}</span>
        </h1>

        {filteredFiles.length === 0 ? (
          <p className="text-muted-foreground">
            No files found in this folder.
          </p>
        ) : (
          <ScrollArea className="h-[80vh] pr-2">
            <div className="flex flex-col gap-1">
              {filteredFiles.map((file) => (    
                <Card 
                  key={file._id}
                  className="px-1 py-1 bg-card text-card-foreground 
                  shadow-sm hover:bg-muted transition-colors duration-150 hover:bg-blue-200 cursor-pointer"
                >
                    <div className='flex items-center justify-between px-4 py-1'>
                    <div className="truncate text-sm text-black font-medium max-w-[70%]">
                        {file.filename} 
                    </div>
                    <div className="text-sm text-muted-foreground flex-shrink-0 pl-4 bg-blue-100 text-blue-800 rounded-full px-2">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
    </div>
  );
};

export default Dashboard;