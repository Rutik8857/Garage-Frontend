'use client'
import React, {useState} from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainDash from './main/page'


const Page = ({ children }) => {

 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };


  
  return (
    <div>
      <div className="flex bg-gray-300">

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar}/> 
     
      
      <MainDash />
      
      
      </div>
      {/* <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>   */}
      

     
    </div>
  )
}

export default page
