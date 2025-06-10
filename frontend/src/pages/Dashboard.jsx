import React, { useState, useEffect } from 'react';
import SideBar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import FolderGrid from '@/components/FolderGrid';
import FileGrid from '@/components/FileGrid'; 
import FileViewer from '@/components/FileViewer';
import {BASE_URL} from '@/lib/config';

const Dashboard = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [categoriesWithFiles, setCategoriesWithFiles] = useState([]);
  const [showCreateFolderModel, setShowCreateFolderModel] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const filteredFiles = files.filter(file =>
  file.filename.toLowerCase().includes(searchTerm.toLowerCase())
);

  const handleFilterChange = (newFilter)=>{
    setFilter(newFilter.toLowerCase().trim());
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/folders`)
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

      let url = `${BASE_URL}/api/files`;

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
    
   <SideBar onCreateFolder={() => setShowCreateFolderModel(true)} 
               onFilterChange={handleFilterChange}/>

   <main className="flex-1 p-0">
        <div className="p-2">
        {Array.isArray(categoriesWithFiles) &&(

    <FolderGrid folders={folders} selected={filter} onSelect={setFilter} />
        )}
        </div>

    <FileGrid files={filteredFiles} filter={filter} onFileClick={(file) => { 
       console.log('Clicked file onject: ', file);
       setSelectedFile(file)}}
      />

    {selectedFile && (<FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
  )}
      </main>
    </div>
    </div>
  );
};

export default Dashboard;