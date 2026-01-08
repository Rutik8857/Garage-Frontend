import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import ReportsAndSearch from '../page'
import SmsMarketingPage from '../page'
import SmsListPage from '../page'
import EditWashingJobPage from '../page'

function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <EditWashingJobPage />
           
          </div>
         
          </div>
        )
}

export default page
