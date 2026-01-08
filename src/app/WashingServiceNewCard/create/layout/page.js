import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import ReportsAndSearch from '../page'
import SmsMarketingPage from '../page'
import SmsListPage from '../page'
import EditWashingJobPage from '../page'
import CreateJobCardPage from '../page'

function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <CreateJobCardPage />
           
          </div>
         
          </div>
        )
}

export default page
