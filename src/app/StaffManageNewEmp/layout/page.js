import Sidebar from '@/app/components/Sidebar'
import React from 'react'
import ReportsAndSearch from '../page'
import SmsMarketingPage from '../page'
import JobsSparesOilsStock from '../page'
import CustomersPage from '../page'
import QuotationPage from '../page'
import AddUserPage from '../page'

function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <AddUserPage />
           
          </div>
         
          </div>
        )
}

export default page
