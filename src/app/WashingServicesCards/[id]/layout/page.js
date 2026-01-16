import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import ReportsAndSearch from '../page'
import SmsMarketingPage from '../page'
import JobsSparesOilsStock from '../page'
import NewWashingJobForm from '../page'
import NewWashingCardPage from '../page'
import WashingCardsPage from '../page'
import JobEditPage from '../edit/page'
import JobDetailsPage from '../page'

function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <JobDetailsPage />
           
          </div>
         
          </div>
        )
}

export default page
