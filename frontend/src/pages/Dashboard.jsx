import React, { useState, useEffect, useRef } from "react";
import SideBar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import FolderGrid from "@/components/FolderGrid";
import FileGrid from "@/components/FileGrid";
import FileViewer from "@/components/FileViewer";
import FolderDialog from "@/components/FolderDialog";
// import CustomFolderGrid from "@/components/CustomFolderGrid";
import { BASE_URL } from "@/lib/config";
import useFileManager from "@/hooks/useFileManager";
import { useCustomFolders } from "@/context/CustomFolderContext";
import { toast } from 'react-toastify';

const Dashboard = () => {

  const { customFolders, setCustomFolders } = useCustomFolders();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [stableFolders, setStableFolders] = useState([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const fileInputRef = useRef(null);
  const [currentFolderId, setCurrentFolderId] = useState("");
  const [filter, setFilter] = useState(() => {
    try {
      const saved = sessionStorage.getItem("selectedFilter");
      return saved ? JSON.parse(saved) : "Recent Files";
    } catch {
      return "Recent Files";
    }
  });
  const { autoFolders, rawFiles, refetchFiles } = useFileManager(filter);

  useEffect(() => {
    sessionStorage.setItem("selectedFilter", JSON.stringify(filter));
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter.toLowerCase().trim());
  };

  const handleUpload = async (file, folderId) => {  
    const formData = new FormData();
    formData.append("myFile", file);
    
    if (folderId && folderId!== "undefined") {
    formData.append("folder", folderId);
    formData.append("customFolder", folderId); // if used by backend
  }
  console.log("Folder:", folderId);
    console.log("Uploading to folder ID:", folderId);
    for (let pair of formData.entries()) {
    console.log(pair[0]+ ': ' + pair[1]);
  }
    try {
      const response = await fetch(`${BASE_URL}/api/uploads`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("File uploaded successfully!");
        await refetchFiles(folderId);
        console.log("Refetching files after upload");
        setCurrentFolderId(folderId); // Update current folder ID after upload
        console.log("File uploaded:", result);
        console.log("CurrentFolderId:", currentFolderId);
      } else {
        toast.error("An error occurred during uplaod.");
        console.error("Upload error:", result.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/api/folders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: folderName.trim() }),
      });
      if (res.status === 409) {
        setShowDuplicateDialog(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to create folder");

      const newFolder = await res.json();
      setCustomFolders((prev) => [...prev, newFolder]);
      setFolderName("");
      setShowFolderDialog(false);
    } catch (err) {
      console.error("Failed to create folder", err);
    }
  };

  const handleUploadToFolder = (folderId) =>{
    if(fileInputRef.current){
      fileInputRef.current.click();
      console.log("File input clicked for folder ID:", folderId);
      setCurrentFolderId(folderId);
    }
  }
    useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/folders`,{
          credentials: "include"
        });
        const data = await res.json();
        setCustomFolders(data);
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };
    fetchFolders();
  }, []);
 
  useEffect(() => {
    if (!showFolderDialog) {
      setFolderName("");
    }
  }, [showFolderDialog]);

  const handleRename = async (folderId) => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) return;

    try {
      const res = await fetch(`${BASE_URL}/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
        credentials: "include",
      });
      if (res.status === 409) {
        setShowDuplicateDialog(true);
      }
      if (!res.ok) throw new Error("Rename failed");

      const updated = await res.json();
      setCustomFolders((prev) =>
        prev.map((folder) =>
          folder._id === folderId ? { ...folder, name: updated.name } : folder
        )
      );
      setRenamingFolderId(null);
      setNewFolderName("");
    } catch (err) {
      console.error("Failed to rename folder:", err);
    }
  };

  useEffect(() => {
    if (!showDuplicateDialog) {
      setNewFolderName("");
      setRenamingFolderId(null);
    }
  }, [showDuplicateDialog]);

  useEffect(() => {
    const folderSet = new Set();
    rawFiles
      .filter((file) => !file.isTrashed)
      .forEach((file) => {
        const folder = file.physicalFolder?.toLowerCase();
        if (folder && autoFolders.includes(folder)) {
          folderSet.add(folder);
        }
      });
    const newFolders = Array.from(folderSet);
    //  console.log(" Recalculating folders from raw files:", newFolders);

    // Prevent infinite loop by updating state only if it's actually different
    const areEqual = stableFolders.length === newFolders.length &&
      stableFolders.every((f, i) => f === newFolders[i]);

    if (!areEqual) {
      setStableFolders(newFolders);
    }
  }, [rawFiles, autoFolders]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        showSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex flex-1">
        <SideBar
          onFilterChange={handleFilterChange}
          onCreateFolder={()=>setShowFolderDialog(true)}
          onUploadFile={()=>fileInputRef.current?.click()}
          handleUploadToFolder={handleUploadToFolder}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // call existing upload function here
              handleUpload(file, currentFolderId);
            }
          }}
          className="hidden"
        />

        <main className="flex-1 p-0">
          <div>
            <FolderGrid
              folders={stableFolders}
              selected={filter?.name || filter}
              onSelect={(type) => setFilter(type)}
              onOpenFolder={handleUploadToFolder}
            />

            <FileGrid
              filter={filter}
              searchTerm={searchTerm}
              onFileClick={(file) => setSelectedFile(file)}
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentFolderId={currentFolderId}
              setCurrentFolderId={setCurrentFolderId}
            />
          </div>

          {selectedFile && (
            <FileViewer
              file={selectedFile}
              onClose={() => setSelectedFile(null)}
            />
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
