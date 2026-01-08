

// "use client";

// import Footer from "@/app/components/Footer";
// import Header from "@/app/components/Header";
// import React, { useState, useEffect } from "react";
// import Axios from 'axios';
// import { useAlert } from '../context/AlertContext';
// import { useRouter } from "next/navigation";


// // --- (SVG Icons are unchanged) ---
// const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" > <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="7 10 12 15 17 10" /> <line x1="12" y1="15" x2="12" y2="3" /> </svg> );
// const ClockIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}> <circle cx="12" cy="12" r="10" /> <polyline points="12 6 12 12 16 14" /> </svg> );

// export default function JobCardsPage() {
//   const { showAlert } = useAlert();
//   const [activeTab, setActiveTab] = useState("Pending");
//   const [jobCards, setJobCards] = useState([]);

//   const router = useRouter();

//   // Fetch data when the component loads and poll for updates
//   useEffect(() => {
//     const fetchJobCards = async () => {
//       try {
//         const response = await Axios.get('http://localhost:3001/api/jobcards');
//         if (response.data.success) {
//           // Defensive mapping: backend column names may differ; provide sensible defaults
//           const formattedData = response.data.data.map(card => {
//             const id = card.id || card.jobCardId || null;
//             const createdAt = card.created_at || card.createdAt || card.created || null;
//             let timestamp = '';
//             try {
//               timestamp = createdAt ? new Date(createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '') : '';
//             } catch (e) {
//               timestamp = String(createdAt || '');
//             }

//             return {
//               id,
//               displayId: id ? `MC-2021-${id}` : 'MC-XXXX-XXXX',
//               number: card.vehicle_no || card.vehicleNo || '',
//               // fix: use `customer_name` (snake_case from DB) not `customer_Name`
//               name: card.customer_name || card.customerName || '',
//               tags: [card.make || '', card.model || '', `Rs. ${card.estimate ?? ''}`],
//               timestamp,
//               status: (card.status || 'pending').toLowerCase(),
//             };
//           });

//           setJobCards(formattedData);
//         }
//       } catch (error) {
//         console.error("Failed to fetch job cards:", error);
//       }
//     };
//     fetchJobCards();

//     // Poll every 5 seconds for real-time updates
//     const interval = setInterval(fetchJobCards, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   // --- NEW: FUNCTION TO HANDLE STATUS CHANGE ---
//   const handleStatusChange = async (cardId, newStatus) => {
//     try {
//       // Step 1: Update the status in the backend
//       await Axios.put(`http://localhost:3001/api/jobcards/${cardId}/status`, { status: newStatus });

//       // Step 2: Update the status in the local state to refresh the UI instantly
//       setJobCards(currentCards =>
//         currentCards.map(card =>
//           card.id === cardId ? { ...card, status: newStatus } : card
//         )
//       );
//     } catch (error) {
//       console.error("Failed to update status:", error);
//       showAlert("Error: Could not update status.", 'error');
//     }
//   };

//    // --- NEW: FUNCTION TO DOWNLOAD EXCEL ---
//   const handleDownloadExcel = async () => {
//     try {
//         const response = await Axios.get('http://localhost:3001/api/jobcards/excel', {
//             responseType: 'blob', // Important for handling binary data
//         });

//         // Create a URL for the blob
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', 'jobcards.xls'); // Filename
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//     } catch (error) {
//         console.error("Failed to download excel:", error);
//         showAlert("Error: Could not download Excel file.", 'error');
//     }
//   };



//   const tabs = [
//     { name: "Pending" },
//     { name: "Completed" },
//     { name: "Closed" },
//   ];

//   // const filteredCards = jobCards.filter(card => card.status === activeTab.toLowerCase());
//   const filteredCards = jobCards.filter(card => card.status === activeTab.toLowerCase());

//   return (
//     <div className="flex flex-col min-h-screen w-full bg-slate-100">
//       <Header />
//       {/* ... (Header section is unchanged) ... */}
//       <main className="flex-grow w-full p-4 sm:p-6 lg:p-8 bg-slate-100">
//         <div className="max-w-7xl mx-auto">

//            <div className="flex justify-between items-center mb-6">
//                  <h1 className="text-2xl font-bold text-gray-800">Job Cards</h1>
//                  <button 
//                     onClick={handleDownloadExcel}
//                     className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow transition duration-150 ease-in-out"
//                  >
//                     <DownloadIcon />
//                     <span>Download Jobcards (.xls)</span>
//                  </button>
//             </div>



//           <div className="rounded-t shadow-md overflow-hidden">
//             <div className="bg-blue-600 p-4">
//               <h2 className="text-lg font-semibold text-white">Job Cards</h2>
//             </div>
//           </div>
//           <div className="p-6 bg-gray-50 shadow-md">
//             <div className="border-b border-slate-200">
//               <nav className="-mb-px flex space-x-6" aria-label="Tabs">
//                 {tabs.map((tab) => {
//                   // Calculate count for each tab dynamically
//                   const count = jobCards.filter(c => c.status === tab.name.toLowerCase()).length;
//                   return (
//                     <button
//                       key={tab.name}
//                       onClick={() => setActiveTab(tab.name)}
//                       className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.name ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
//                     >
//                       {tab.name} ({count})
//                     </button>
//                   );
//                 })}
//               </nav>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
//               {filteredCards.map((card) => (
//                 <div key={card.id} 
               
//                   onClick={() => router.push(`/JobCardList/${card.id}/layout`)}
//                 className="rounded-lg shadow-md overflow-hidden bg-white flex flex-col cursor-pointer">
//                   <div className="p-5 text-teal-800 flex-grow">
//                     {/* ... (Card content is mostly unchanged) ... */}
//                     <p className="text-sm font-semibold text-gray-500">{card.displayId}</p>
//                     <p className="text-2xl font-bold tracking-wider my-1 text-gray-800">{card.number}</p>
//                     <p className="text-base font-medium text-gray-700">{card.name}</p>
//                      {/* ... (Tags section is mostly unchanged) ... */}
//                   </div>
//                   {/* --- NEW: STATUS CHANGE BUTTONS --- */}
//                   <div className="bg-gray-50 p-3 border-t flex justify-around items-center gap-2">
//                     <span className="text-xs font-bold text-gray-500">MARK AS:</span>
//                     {card.status !== 'completed' && (
//                       <button onClick={() => handleStatusChange(card.id, 'completed')} className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors">
//                         Completed
//                       </button>
//                     )}
//                     {card.status !== 'closed' && (
//                        <button onClick={() => handleStatusChange(card.id, 'closed')} className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors">
//                         Closed
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//              {/* ... (Pagination section is unchanged) ... */}
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }




"use client";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import React, { useState, useEffect } from "react";
import Axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { useRouter } from "next/navigation";

// --- Icons ---
const DownloadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" > <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="7 10 12 15 17 10" /> <line x1="12" y1="15" x2="12" y2="3" /> </svg> );
// Clock Icon styled to match the yellow/gold look from the image
const ClockIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}> <path d="M12,2A10,10 0 1,0 22,12,10,10 0 0,0 12,2Zm0,18a8,8 0 1,1 8-8A8,8 0 0,1 12,20Z" opacity=".5"/><path d="M12.5,7a.5.5,0,0,0-1,0v5a.5.5,0,0,0,.2.4l3,2.5a.5.5,0,0,0,.6-.8L12.5,11.8Z"/> </svg> );

export default function JobCardsPage() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState("Pending");
  const [jobCards, setJobCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Add Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const ITEMS_PER_PAGE = 10; // Should match backend limit

  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // --- 2. Update Fetch Logic & Dependencies ---
  useEffect(() => {
    const fetchJobCards = async () => {
      setIsLoading(true);
      try {
        const response = await Axios.get(`${apiUrl}/api/jobcards`, {
          params: {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            status: activeTab.toLowerCase()
          }
        });
        if (response.data.success) {
          const formattedData = response.data.data.map(card => {
            const id = card.id || card.jobCardId || null;
            const createdAt = card.created_at || card.createdAt || card.created || null;
            let timestamp = '';
            try {
              // Format Date like: 18 Dec 2025 12:05 PM
              timestamp = createdAt ? new Date(createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '') : '';
            } catch (e) {
              timestamp = String(createdAt || '');
            }

            return {
              id,
              displayId: id ? `MC-2025-${id}` : 'MC-XXXX-XXXX', // Updated year to match image
              number: card.vehicle_no || card.vehicleNo || '',
              name: card.customer_name || card.customerName || '',
              // Only Make and Model for tags, as per image
              tags: [card.make, card.model].filter(Boolean), 
              timestamp,
              status: (card.status || 'pending').toLowerCase(),
            };
          });

          setJobCards(formattedData);
          // Set pagination state from API response
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalRecords(response.data.pagination.totalRecords);
          }
        }
      } catch (error) {
        console.error("Failed to fetch job cards:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobCards();
  }, [currentPage, activeTab]); // Refetch when page or tab changes

  // --- 3. Reset to page 1 when tab changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleStatusChange = async (cardId, newStatus) => {
    try {
      await Axios.put(`${apiUrl}/api/jobcards/${cardId}/status`, { status: newStatus });
      setJobCards(currentCards =>
        currentCards.map(card =>
          card.id === cardId ? { ...card, status: newStatus } : card
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      showAlert("Error: Could not update status.", 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
        console.log("Requesting Excel URL:", `${apiUrl}/api/jobcards/excel`);
        const response = await Axios.get(`${apiUrl}/api/jobcards/excel`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'jobcards.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Failed to download excel:", error);
        showAlert("Error: Could not download Excel file.", 'error');
    }
  };

  const tabs = [
    { name: "Pending" },
    { name: "Completed" },
    { name: "Closed" },
  ];

  // The backend now handles filtering, so we can use the jobCards state directly.
  // The `filteredCards` variable is kept for minimal code change.
  const filteredCards = jobCards;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <main className="flex-grow w-full p-4 sm:p-6 lg:p-8 bg-slate-100">
        <div className="max-w-7xl mx-auto">

           <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-gray-800">Job Cards</h1>
                 <button 
                    onClick={handleDownloadExcel}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow transition duration-150 ease-in-out"
                 >
                    <DownloadIcon />
                    <span className="ml-2">Download Jobcards (.xls)</span>
                 </button>
            </div>

          <div className="rounded-t shadow-md overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-lg font-semibold text-white">Job Cards</h2>
            </div>
          </div>
          <div className="p-6 bg-gray-50 shadow-md">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const count = jobCards.filter(c => c.status === tab.name.toLowerCase()).length;
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.name ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
                    >
                      {tab.name} ({count})
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p>No job cards found for "{activeTab}" status.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredCards.map((card) => (
                    <div key={card.id} 
                      onClick={() => router.push(`/JobCardList/${card.id}/layout`)}
                      className="rounded-lg shadow-md overflow-hidden bg-gray-100 flex flex-col cursor-pointer hover:shadow-lg transition-shadow border border-gray-300"
                    >
                      <div className="p-5 flex-grow relative">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-700 tracking-wide">{card.displayId}</span>
                            <ClockIcon className="text-yellow-500 w-10 h-10 opacity-30 absolute top-4 right-4" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-800 mb-1 uppercase tracking-tight">{card.number}</h3>
                        <p className="text-sm font-bold text-gray-700 mb-4 capitalize">{card.name}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {card.tags.map((tag, idx) => (
                                <span key={idx} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">{tag}</span>
                            ))}
                        </div>
                      </div>
                      <div className=" pb-4 border-t border-gray-300 w-full text-center ">
                        <p className="text-md text-gray-500 font-medium">{card.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- 4. Add Pagination JSX --- */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                      Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                      <span className="hidden sm:inline text-gray-400"> ({totalRecords} total records)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                        Previous
                      </button>
                      
                      {/* Dynamic Page Numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let p = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            p = currentPage - 2 + i;
                            if (p > totalPages) p = totalPages - (4 - i);
                          }
                          if (p < 1 || p > totalPages) return null;
                          return (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`px-3 py-1.5 text-sm rounded-md border ${
                                currentPage === p 
                                  ? 'bg-blue-600 text-white border-blue-600' 
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {p}
                            </button>
                          );
                      })}

                      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
