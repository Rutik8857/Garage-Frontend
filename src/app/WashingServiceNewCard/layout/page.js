import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import ReportsAndSearch from '../page'
import SmsMarketingPage from '../page'
import JobsSparesOilsStock from '../page'
import NewWashingJobForm from '../page'
import NewWashingCardPage from '../page'

function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <NewWashingCardPage />
           
          </div>
         
          </div>
        )
}

export default page
