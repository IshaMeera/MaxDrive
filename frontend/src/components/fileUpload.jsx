import React, { use, useRef, useState } from 'react';
import '../styles/App.css';
import uploadIcon from '../assets/upload.png';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleClick = () =>{
    navigate('/dashboard');
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? `Selected File: ${file.name}` : '');
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <div className="download-icon">
          <img src={uploadIcon} alt="Upload Icon" />
        </div>

        <div>
          <button onClick={()=>navigate('/dashboard')}>Go to Dashboard</button>
        </div>

        <p className="p">Drag and Drop file<br />or</p>

        <form action="http://localhost:3000/api/uploads" method="post" encType="multipart/form-data">
          <label id="browseLink" onClick={handleBrowseClick}>Browse</label>
          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            name="myFile"
            hidden
            onChange={handleFileChange}
          />
          {fileName && <p id="file-name">{fileName}</p>}
          <br /><br />
          <button type="submit" className="submit-btn"> Upload </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;
