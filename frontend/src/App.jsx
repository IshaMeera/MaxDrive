import React from 'react';
import FileUpload from './components/fileUpload';
import Dashboard from './pages/Dashboard';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  return(
      <Routes>
        <Route path="/" element={<FileUpload/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        console.log("App component rendered");
      </Routes>
  )
}

export default App;