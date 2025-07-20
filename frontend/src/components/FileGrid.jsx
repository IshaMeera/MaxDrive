import React, { useRef, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/lib/config";
import EmptyFolder from "@/assets/EmptyFolder.svg?react";
import { Image, Video, FileText, FileArchive, File, FileSpreadsheet, MoreVertical } from "lucide-react";
import useFileManager from "@/hooks/useFileManager";
import ContextMenu from "./ContextMenu";
import { FaFilePdf, FaFileArchive, FaFileExcel, FaFileAlt, FaStar,FaRegStar } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCustomFolders } from "@/context/CustomFolderContext";
import ShareModel from "./ShareModel";

const FileGrid = ({filter = "", searchTerm = "", onFileClick, viewMode = "table", setViewMode = "", setCurrentFolderId}) => {
  const linkRefs = useRef({});
  const {files, folders, handleStar, handleTrash, handleRestore, handleDeletePermanent,
     setRawFiles, setAllFiles, setFilteredFiles } = useFileManager(filter);
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, file: null });
  const [shareFile, setShareFile] = useState(null);
  const {customFolders, setCustomFolders} = useCustomFolders();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".custom-context-menu")) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);
  const isTrashView =
    filter === "trash" ||
    filter === "trashed" ||
    (typeof filter === "string" &&
      (filter.name === "trash" || filter.name === "trashed")) ||
    (typeof filter === "object" &&
      (filter.name === "trash" || filter.name === "trashed"));

  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessi ngml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
    txt: "text/plain",
    csv: "text/csv",
    mp4: "video/mp4",
  };
  const extDisplayMap = {
    jpg: "JPG File",
    jpeg: "JPEG File",
    png: "PNG File",
    mp4: "MP4 Video",
    txt: "Text File",
    csv: "CSV File",
    pdf: "PDF File",
    docx: "Word Document",
    xlsx: "Excel File",
    zip: "ZIP Archive",
  };
  const searchedFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filesWithPreview = searchedFiles.map((file) => {
    if (!file.filename) {
      console.warn("Missing file name or file:", file);
      return file;
    }
    const extenstion = file.filename.split(".").pop().toLowerCase();
    // let folder = file.folder || file.physicalFolder || file.previousFolder || 'others';

    return {
      ...file,
      extenstion,
      extLabel: extDisplayMap[extenstion] || `${extenstion.toUpperCase()} File`,
      nameWithoutExt: file.filename.replace(`.${extenstion}`, ""),
      mimetype: mimeTypes[extenstion] || "application/octet-stream",
      url: `${BASE_URL}/uploads/${file.physicalFolder}/${file.filename}`,
    };
  });
  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "jpg":
      case "jpeg":
      case "png":
        return <Image className="w-4 h-4 text-blue-400 mr-2" />;
      case "pdf":
      case "txt":
      case "docx":
        return <FileText className="w-4 h-4 text-gray-400 mr-2" />;
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className="w-4 h-4 text-green-500 mr-2" />;
      case "zip":
        return <FileArchive className="w-4 h-4 text-orange-400 mr-2" />;
      case "mp4":
        return <Video className="w-4 h-4 text-purple-400 mr-2" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground mr-2" />;
    }
  };
  const handleOpenFolder = async (folder) => {
    try {
      const folderRes = await fetch(
        `${BASE_URL}/api/folders?parent=${folder._id}`
      );
      const contentType = folderRes.headers.get("content-type");

      if (!folderRes.ok || !contentType.includes("application/json")) {
        const text = await folderRes.text();
        throw new Error("Expected JSON but got: " + text.slice(0, 100));
      }

      const subFolders = await folderRes.json();

      const filesRes = await fetch(
        `${BASE_URL}/api/files?folder=${folder._id}`
      );
      if (!filesRes.ok) throw new Error("Failed to fetch files");
      const files = await filesRes.json();

      setCurrentFolderId(folder);
      setCustomFolders(subFolders);
      setRawFiles(files);
      setFilteredFiles(files);
      sessionStorage.setItem("currentFolderId", folder._id);
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground">
        <EmptyFolder className="w-40 h-40 mb-4 opacity-70" />
        <p className="text-lg font-medium">No files here yet</p>
        <p className="text-sm text-muted-foreground">
          Upload your first file to get started.
        </p>
      </div>
    );
  }
  const renderRenameInput = (file) => {
    return (
      <div>
        {renamingFileId === file._id ? (
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                const finalName = `${newFileName.trim()}.${file.extenstion}`;
                try {
                  const response = await fetch(
                    `${BASE_URL}/api/files/${file._id}/rename`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ newName: finalName }),
                      credentials: "include",
                    }
                  );

                  const result = await response.json();

                  const updateItemById = (list, id, updates) =>
                    list.map((item) =>
                      item._id === id ? { ...item, ...updates } : item
                    );
                  if (response.ok) {
                    const updatedFields = {
                      filename: finalName,
                      nameWithoutExt: newFileName.trim(),
                    };
                    setAllFiles((prev) =>
                      updateItemById(prev, file._id, { filename: finalName })
                    );
                    setRawFiles((prev) =>
                      updateItemById(prev, file._id, updatedFields)
                    );
                    setFilteredFiles((prev) =>
                      updateItemById(prev, file._id, updatedFields)
                    );
                    console.log("Renamed file immediately:", updatedFields);
                  } else {
                    console.error("Rename failed:", result);
                  }
                } catch (error) {
                  console.error("Rename error:", error);
                } finally {
                  setRenamingFileId(null);
                }
              }
              if (e.key === "Escape") {
                setRenamingFileId(null);
              }
            }}
            className="text-sm bg-white text-black border border-gray-300 px-2 py-0.5 w-full"
            autoFocus
          />
        ) : (
          <span
            className="block truncate max-w-[100px] sm:max-w-[120px] md:max-w-[160px]"
            title={file.nameWithoutExt}
          >
            {file.nameWithoutExt}
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 p-2 rounded shadow-md bg-white">
        <div className="flex items-center gap-2">
          {/* <span className="font-bold text-blue-800">Files in:</span> */}
          <span className="capitalize text-primary font-medium">
            {typeof filter === "string" ? filter : filter?.name || "Untitled"}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-sm">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewMode("table")}>
              List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("preview")}>
              Preview
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {viewMode === "table" ? (
        <>
          <div className="relative">
            <ScrollArea className="h-[80vh] pr-2">
              <div className="grid grid-cols-4 gap-4 px-6 py-2 text-sm font-zinc-400 text-muted-foreground border-b text-left">
                <div className="text-right pr-50">Name</div>
                <div>Type</div>
                <div>Date Modified</div>
                <div className="pl-4 text-right">Size</div>
              </div>

              <div className="flex flex-col gap-1">
                {folders.length > 0 &&
                  folders.map((folder) => (
                    <div
                      key={folder._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFolder(folder);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          visible: true,
                          x: e.pageX,
                          y: e.pageY,
                          folder,
                        });
                      }}
                      className="grid grid-cols-4 gap-4 items-center p-2 rounded hover:bg-zinc-100 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-6 col-span-1">
                        <FaFolder className="text-gray-700" size={21} />
                        <span className="truncate font-medium">
                          {folder.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Folder
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(folder.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-end pr-4">
                        —fillit
                      </div>
                    </div>
                  ))}

                {filesWithPreview.length === 0 &&
                  folders.length ===
                    0(
                      <p className="text-gray-500 text-sm">
                        No files or folders to display
                      </p>
                    )}

                {filesWithPreview.map((file) => {
                  return (
                    <div
                      key={file._id}
                      onClick={() => onFileClick(file)}
                      onDoubleClick={() => {
                        if (linkRefs.current[file._id]?.current) {
                          linkRefs.current[file._id].current.click();
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          visible: true,
                          x: e.pageX,
                          y: e.pageY,
                          file,
                        });
                      }}
                      className="grid grid-cols-4 gap-4 items-center p-2 rounded hover:bg-zinc-100 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 col-span-1">
                        {!isTrashView &&
                          (file.isStarred ? (
                            <FaStar
                              size={18}
                              className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors duration-200 ease-in-out"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStar(file._id);
                              }}
                            />
                          ) : (
                            <FaRegStar
                              size={18}
                              className="text-zinc-400 cursor-pointer hover:text-blue-300 transition-colors duration-200 ease-in-out"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStar(file._id);
                              }}
                            />
                          ))}
                        {getFileIcon(file.filename)}

                        {renderRenameInput(file)}
                      </div>

                      <div className="text-xs text-muted-foreground col-span-1">
                        {file.extLabel}
                      </div>

                      <div className="text-xs text-muted-foreground col-span-1">
                        {new Date(file.uploadDate).toLocaleString()}
                      </div>

                      <div className="text-xs text-muted-foreground flex justify-end pr-4 col-span-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      {/* Hidden anchor to trigger programmatically */}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        ref={linkRefs.current[file._id]}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      >
                        Hidden link
                      </a>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      ) : (
        // preview mode
        <div className="relative grid grid-cols-2 md:grid-cols-6 gap-6">
          {folders.length > 0 &&
            folders.map((folder) => (
              <div
                key={folder._id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenFolder(folder);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    visible: true,
                    x: e.pageX,
                    y: e.pageY,
                    folder,
                  });
                }}
                className="group relative flex flex-col items-center justify-center w-full rounded-xl p-4 bg-blue-50 shadow hover:scale-105 transition"
              >
                <FaFolder className="text-gray-600" size={25} />
                <span className="truncate mt-2 font-medium">{folder.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      visible: true,
                      x: e.pageX,
                      y: e.pageY,
                      folder,
                    });
                  }}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
          {filesWithPreview.map((file) => (
            <div
              key={file._id}
              onClick={() => onFileClick(file)}
              onDoubleClick={() => {
                if (linkRefs.current[file._id]?.current) {
                  linkRefs.current[file._id].current.click();
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  visible: true,
                  x: e.pageX,
                  y: e.pageY,
                  zIndex: 99999,
                  file,
                });
              }}
              className="group relative flex flex-col w-full rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white hover:scale-105"
            >
              <div className="relative w-full h-32">
                {file.mimetype.startsWith("image/") && (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                {file.mimetype.startsWith("video/") && (
                  <video
                    src={file.url}
                    className="object-cover w-full h-full"
                    controls
                    muted
                    loop
                  />
                )}
                {/* Icons for other types epcept vdo or img */}
                {!file.mimetype.startsWith("image/") &&
                  !file.mimetype.startsWith("video/") && (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-100">
                      {file.mimetype.includes("pdf") && (
                        <FaFilePdf size={48} className="text-red-400" />
                      )}
                      {file.mimetype.includes("zip") && (
                        <FaFileArchive size={48} className="text-blue-400" />
                      )}
                      {(file.mimetype.includes("excel") ||
                        file.mimetype.includes("spreadsheet")) && (
                        <FaFileExcel size={48} className="text-green-400" />
                      )}
                      {file.mimetype.startsWith("application/") &&
                        !file.mimetype.includes("pdf") &&
                        !file.mimetype.includes("zip") &&
                        !file.mimetype.includes("excel") && (
                          <FaFileAlt size={48} className="text-blue-400" />
                        )}
                    </div>
                  )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("clicked on:", file);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setContextMenu({
                      visible: true,
                      x: rect.left + rect.width / 2 + window.scrollX,
                      y: rect.bottom + 5 + window.scrollY,
                      file,
                    });
                  }}
                  className="absolute top-2 right-2 text-black hover:text-zinc-700 z-20 bg-white/70 backdrop-blur p-1 rounded-full transition"
                >
                  <PiDotsThreeVerticalBold size={18} />
                </button>
              </div>
              <div className="flex items-center justify-center p-2 w-full">
                {renderRenameInput(file)}
              </div>
            </div>
          ))}
        </div>
      )}
      <ContextMenu
        file={contextMenu.file}
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        inTrashView={filter === "trashed"}
        filter={filter}
        handleStar={handleStar}
        handleTrash={handleTrash}
        handleRestore={handleRestore}
        handleDeletePermanent={handleDeletePermanent}
        onRename={(file) => {
          setRenamingFileId(file._id);
          setNewFileName(file.nameWithoutExt);
        }}
        setShareFile={setShareFile}
      />
      {shareFile && (
        <ShareModel file={shareFile} onClose={() => setShareFile(null)} />
      )}
    </div>
  );
};

export default FileGrid;
