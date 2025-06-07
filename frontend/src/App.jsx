import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
// import TestComponent from '@/components/TestComponent'
import FileUpload from '@/pages/FileUpload'
import Dashboard from '@/pages/Dashboard'

function App() {
  

  return (
    <Routes>
      <Route path='/' element={<FileUpload/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>
  )
}

export default App
