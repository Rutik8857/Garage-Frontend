import Sidebar from '@/app/components/Sidebar'
import JobEditPage from '../page'


function page() {
   return (
          <div>
          <div className='flex flex-row'>
            <Sidebar />
            <JobEditPage />
           
          </div>
         
          </div>
        )
}

export default page
