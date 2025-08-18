import { useCallback, useEffect, useState } from "react";
import { BASE_URL } from "@/lib/config";
import { all } from "axios";
import { useCustomFolders } from '@/context/CustomFolderContext';

const useFileManager = (filter = all) => {
    const {customFolders, setCustomFolders} = useCustomFolders();
    const [_allFiles, setAllFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [loading, _setLoading] = useState(true);
    const [error, _setError] = useState(null);
    const [rawFiles, setRawFiles] = useState([]);

    const autoFolders = ["images", "pdf", "videos", "documents", "excel", "zips", "archives", "csv", "others"];

  useEffect(()=> {
    const establishSessionAndFetch = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/session`, {
          method: 'GET',
          credentials: 'include',
        });
        if(!res.ok) throw new Error('Failed to establish session');

        const data = await res.json();
        console.log("Session established:",data);
      } catch (err) {
        console.error("Error establishing session:", err);
      }
    }
    establishSessionAndFetch();
  },[]);

  //fetch folders
        const fetchFolders = useCallback(async(parentFolderId) => {
          try{

            const parentParam = parentFolderId ? parentFolderId : "null";

            const res = await fetch(
              `${BASE_URL}/api/folders?parent=${encodeURIComponent(parentParam)}`,
              { credentials: 'include' });

            if(!res.ok) throw new Error('Failed to fetch folders');
            
            const foldersData = await res.json();
            setCustomFolders(foldersData);
            //console.log("Fetched folders:", foldersData);
          }catch(err){
          console.error('Error fetching folders:', err.message);
        }
      },[setCustomFolders]);
      useEffect(()=> {
        fetchFolders();
      },[]) //to supress eslint warning wrapped fetchFolders in useCallback

  useEffect(() => {
      console.log("rawFiles in useFileManager:", rawFiles);
      console.log("filteredFiles in useFileManager:", filteredFiles);
    }, [rawFiles, filteredFiles]);

    const refetchFiles = async(controller = new AbortController()) => {
    const normalizedFilter = typeof filter === 'string'    
       ?filter.toLowerCase().trim()
       :(filter?.name?.toLowerCase().trim() || 'all');
      console.log('Normalized filter:', normalizedFilter);

      let url = `${BASE_URL}/api/files`;

      // const filtered = all;

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
      }else{
        console.log("Filter did not match any condition");
      }

      try{
        const response = await fetch(url, {
          signal: controller.signal,
          credentials: "include"
        });
        
        if(!response.ok) throw new Error('Failed tp fetch files');
        const allData = await response.json();                    //console.log('Filters:', filter);  console.log('Files:', files);  console.log('Fetching url:', url);        
        
        setAllFiles(allData);  
        
        const filterValue = filter?.name || filter; 

        if(filterValue.toLowerCase() === 'recent files'){
          const recentSorted = [...allData]
            .filter(file => !file.isTrashed)
            .sort((a,b)=> new Date(b.uploadDate)-new Date(a.uploadDate));
            setFilteredFiles(recentSorted);
            return;
        }
        const normalizedFilter = filterValue.toLowerCase(); 
        const filtered = allData.filter(file =>{
          if(file.isTrashed && normalizedFilter !== 'trashed') return false;

          if(normalizedFilter === 'trashed') return file.isTrashed;

          if(normalizedFilter === 'starred') return file.isStarred && !file.isTrashed;

          if(autoFolders.includes(normalizedFilter)){
            return file.physicalFolder?.toLowerCase().trim() === normalizedFilter.trim() && !file.isTrashed;
          }
          if(typeof filter === 'object' && filter.type === 'custom'){
            return file.customFolder === filter._id && !file.isTrashed;
          }
          if(normalizedFilter === 'all'){
            return !file.isTrashed;
          }
          return false;
        })
        setFilteredFiles(filtered);
      }catch(err){
        if(err.name === 'AbortError'){
          console.warn('file fetching req was aborted');
      }else{
        console.error('Error fetching files:', err.message);
      }
    }
  }
    useEffect(()=>{
      const controller = new AbortController();
      refetchFiles(controller);
      return () => controller.abort();
    }, [filter]); //runs on first mount n filter changes
        
const handleStar = async(fileId) =>{
    try{
        const targetFile = rawFiles.find(file => file._id === fileId);
        if(!targetFile){
          console.error(`File with ID ${fileId} not found in rawFiles`);
          return;
        }

        const updatedRawFile = rawFiles.map(file =>
          file._id === fileId ? {...file, isStarred: !file.isStarred} : file
        );
        setRawFiles(updatedRawFile);

        const currentFilter = filter?.name || filter;

        if(currentFilter === 'starred'){
          setFilteredFiles(prev => prev.filter(file=> file._id !== fileId));
        }else{
          const updatedFilter = filteredFiles.map(file =>
            file._id === fileId ? {...file, isStarred: !file.isStarred} : file
          );
          setFilteredFiles(updatedFilter);
        }

        const res = await fetch(`${BASE_URL}/api/files/${fileId}/star`,{
          method: "PATCH",
          headers: {"Content-Type":"application/json"},
          credentials: "include"
        })
        if(!res.ok){
          targetFile.isStarred = !targetFile.isStarred;
          setRawFiles([...updatedRawFile]);
          throw new Error('Failed to update star');
        }
      }catch(err){
        console.error('Failed to star file', err);
      }
      };

const handleTrash = async(fileId) =>{
    try{
        console.log(`Sending req to: ${BASE_URL}/api/files/${fileId}/trash`);
        const res = await fetch(`${BASE_URL}/api/files/${fileId}/trash`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        });
        if(!res.ok) throw new Error('Failed to move file to trash');
        refetchFiles(); //refetch updated file list
    }catch(err){
        console.error('Failed to trash file:', err);
    }  
}

const handleRestore = async(fileId) =>{
 try {
    const res = await fetch(`${BASE_URL}/api/files/${fileId}/restore`, {
      method: "PATCH",
      credentials: "include"
    });
    const result = await res.json();

    if (res.ok) {
      await refetchFiles();
      // // Update UI
      // setAllFiles((prev) => prev.filter(f => f._id !== fileId)); // remove from trash UI
    } else {
      console.error("Restore failed", result);
    }
  } catch (err) {
    console.error("Restore error", err);
  }
};

const handleDeletePermanent = async(fileId) =>{
  try{
    const res = await fetch(`${BASE_URL}/api/files/${fileId}`, {
      method: "DELETE",
      credentials: "include"
  });
  if(!res.ok) throw new Error('Permanent delete failed');
  await refetchFiles(); //refetch updated file list
  // setAllFiles((prev) => prev.filter(file => file._id !== fileId));
}catch(err){
  console.error('Permanent delete error:', err);
}
}

 return{files: filteredFiles, folders: customFolders, setCustomFolders, setAllFiles, 
  loading, error, autoFolders, rawFiles, setRawFiles, setFilteredFiles,handleStar, 
  handleTrash, refetchFiles, fetchFolders, filteredFiles, handleRestore, handleDeletePermanent};
 }

export default useFileManager; 
