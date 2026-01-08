import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import JobCardsPage from '../page'

function page() {
   return (
      <div>
      <div className='flex flex-row'>
        <Sidebar />
        <JobCardsPage />
      </div>
     
      </div>
    )
  
}

export default page
