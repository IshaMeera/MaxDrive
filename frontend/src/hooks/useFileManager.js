import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/config";
import { all } from "axios";

const useFileManager = (filter = all) => {
    const [allFiles, setAllFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [categoriesWithFiles, setCategoriesWithFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawFiles, setRawFiles] = useState([]);

    const autoFolders = ["images", "pdf", "videos", "documents", "excel", "zips", "archives", "csv", "others"];

    const refetchFiles = async(controller = new AbortController()) => {

    const normalizedFilter = typeof filter === 'string'    
       ?filter.toLowerCase().trim()
       :(filter?.name?.toLowerCase().trim() || 'all');

      console.log('Normalized filter:', normalizedFilter);
      let url = `${BASE_URL}/api/files`;
      const filtered = all
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
      // } else if(normalizedFilter !== "all" && normalizedFilter !== "View all files"){
      //   url += `?folder=${normalizedFilter}`;
      // }

      try{
        const response = await fetch(url, {signal: controller.signal});
        if(!response.ok) throw new Error('Failed tp fetch files');

        const allData = await response.json();                    //console.log('Filters:', filter);  console.log('Files:', files);  console.log('Fetching url:', url);        
        setAllFiles(allData);  
        console.log("Refetched all files:", allData.length);

        const filterValue = filter?.name || filter; 
        const filtered = allData.filter((file)=>{
        if (filterValue === 'all') return !file.isTrashed;
        if (filterValue === 'starred') return file.isStarred && !file.isTrashed;
        if (filterValue === 'trashed') return file.isTrashed;
        const fileType = file.folder || file.type?.toLowerCase();
        return fileType === filterValue.toLowerCase() && !file.isTrashed;
        });
  
        setFilteredFiles(filtered);
        
      }catch(err){
       if(err.name === 'AbortError'){
        console.log('Fetch aborted');
      }else{
        console.error('Fetch error:', err.message);
      }
    }
    };

const handleStar = async(fileId) =>{
    try{
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
        const res = await fetch(`${BASE_URL}/api/files/${fileId}/trash`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
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

const handleDeletePremanet = async(fileId) =>{
  try{
    const res = await fetch(`${BASE_URL}/api/files/${fileId}`, {
      method: "DELETE",
  });
  if(!res.ok) throw new Error('Permanent delete failed');
  await refetchFiles(); //refetch updated file list
  // setAllFiles((prev) => prev.filter(file => file._id !== fileId));
}catch(err){
  console.error('Permanent delete error:', err);
}
}
useEffect(()=>{
      const controller = new AbortController();
      refetchFiles(controller);
      return () => controller.abort();
    }, [filter]);

useEffect(() =>{
  const fetchFiles = async() =>{
    try{
      const res = await fetch(`${BASE_URL}/api/files`);
      const data = await res.json();
      setRawFiles(data);
    }catch(err){
      console.error('Failed to fetch files:', err);
    }
  }
  fetchFiles();
},[]);

 return{files: filteredFiles, setAllFiles, loading, error, autoFolders, rawFiles, setRawFiles, setFilteredFiles,
  handleStar, handleTrash, refetchFiles, filteredFiles, handleRestore, handleDeletePremanet};
 }

export default useFileManager; 