import React from 'react'
import Sidebar from '@/app/components/Sidebar'
import JobCardForm from '../page'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

function MainCard() {
  return (
    
    <div className='flex '>
    <Sidebar />
  <JobCardForm />     
    </div>
   
   
  )
}

export default MainCard