import React from 'react'
import MakeModelVariantPage from '../page'
import Sidebar from '@/app/components/Sidebar'

function page() {
   return (
        <div>
        <div className='flex flex-row'>
          <Sidebar />
          <MakeModelVariantPage />
         
        </div>
       
        </div>
      )
}

export default page
