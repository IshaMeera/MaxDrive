import React from 'react';

const SideBar = ({onSelectFolder, selected}) => {
    const folders = [
        "csv",
        "documents",
        "excel",      
        "images",
        "pdf",
        "videos",
        "zips",
        "others",
        "archives"
    ];

    return(
        <div className='w-64 bg-gray-100 h-screen p-4 border-r'>
            <h2 className='text-xl font-bold mb-4'>Max Drive</h2>
            <ul>
                {folders.map((folder)=>(
                    <li
                      key={folder}
                      onClick={()=> onSelectFolder(folder)}
                      className={`p-2 cursor-pointer rounded hover:bg-gray-300 ${
                        selected === folder ? 'bg-gray-300 font-semibold' :""}`}>
                        {folder.charAt(0).toUpperCase() + folder.slice(1)}
                        </li>
                ))}
            </ul>
        </div>
    )
}

export default SideBar;