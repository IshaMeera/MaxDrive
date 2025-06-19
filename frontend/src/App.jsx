import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
// import TestComponent from '@/components/TestComponent'
import FileUpload from '@/pages/FileUpload'
import Dashboard from '@/pages/Dashboard'
import 'react-toastify/dist/ReactToastify.css'
import { Slide } from 'react-toastify'

function App() {
  

  return (
    <>
    <Routes>
      <Route path='/' element={<FileUpload/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
    </Routes>

    <ToastContainer
    position="top-right"
    autoClose={3000}
    transition={Slide}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark" // or use "light" if you're not using dark mode
    toastClassName="bg-zinc-800 text-white rounded-lg shadow-lg p-4"
    bodyClassName="text-sm font-medium"
  />
    </>
  )
}

export default App
