import React, { useState, useEffect } from 'react';
import SideBar from '../components/sideBar';
import '../styles/App.css'; 
// import { use } from 'react';

const Dashboard = () =>{
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async() =>{
            try{
                const res = await fetch(`http://localhost:3000/api/files?type=${selectedFolder}`);
                const data = await res.json();
                setFiles(data);
            }catch(err){
                console.error('Error fetching files:', err);
            }
        };
        fetchFiles();
    }, [selectedFolder]);

    useEffect(() => {
        fetch('http://localhost:3000/api/folders')
            .then((res) => {
            console.log("Raw response:", res); // ✅ Add this
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json(); //If it's HTML, this line will throw
            })
            .then((data) => {
            console.log("Fetched folder data:", data);
            setFolders(data);
            if (data.length > 0) {
                setSelectedFolder(data[0]);
            }
            })
            .catch((err) => {
            console.error("Error fetching folders:", err);
            });
        }, []);

    // useEffect(() => {
    //     if (selectedFolder) {
    //     fetch(`http://localhost:3000/api/files/${selectedFolder}`)
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log('Files in selected folder:', data);
    //             setFiles(data);
    //         })
    //         .catch((err) => console.error('Error fetching files:', err));
    //     }
    // }, [selectedFolder]);


    return(
        <div className='flex'>
            <SideBar
                selected = {selectedFolder}
                onSelectFolder={setSelectedFolder}
            />
            <div>
                <h1>Folders</h1>
                <ul>
                    {folders.map((folder)=>(
                        <li key={folder} onClick={()=> setSelectedFolder(folder)}>
                            {folder}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex-1 p-6'>
                <h1 className='text-2xl font-bold mb-4'>
                    files in: {selectedFolder}
                </h1>
                <ul>
                    {files.map((file)=>(
                        <li key={file._id}>
                        {file.filename} - {(file.size / (1024 * 1024)).toFixed(2)} MB 
                        </li>
                    ))}
                </ul>
            
            </div>
        </div>
    );
}

export default Dashboard;