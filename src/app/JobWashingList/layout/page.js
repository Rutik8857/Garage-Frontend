import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import ReportsAndSearch from '../page'
import SmsMarketingPage from '../page'
import JobsSparesOilsStock from '../page'
import WashingJobsPage from '../page'

function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <WashingJobsPage />
           
          </div>
         
          </div>
        )
}

export default page
