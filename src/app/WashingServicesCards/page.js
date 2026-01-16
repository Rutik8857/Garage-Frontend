




"use client";

import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const StatusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) { // Added ?. safely check
    case 'completed': return 'text-green-600 bg-green-100';
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'closed': return 'text-gray-600 bg-gray-100';
    default: return 'text-blue-600 bg-blue-100';
  }
};

export default function WashingCardsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. NEW: State to store search text ---
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/washing-jobs`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        if (result.success) {
          setJobs(result.data);
        } else {
          throw new Error(result.message || 'Failed to get jobs');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // --- 2. NEW: Filter Logic ---
  // We create a new array 'filteredJobs' based on the 'searchTerm'
  const filteredJobs = jobs.filter((job) => {
    // If search is empty, return everything
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.toLowerCase();
    
    // Check Customer Name OR Mobile Number
    // (We convert mobile to string just in case it comes as a number from API)
    return (
      (job.customerName && job.customerName.toLowerCase().includes(lowerSearch)) ||
      (job.mobileNumber && String(job.mobileNumber).includes(lowerSearch))
    );
  });

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <header className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Washing Jobs</h1>
              <nav aria-label="breadcrumb" className="text-sm text-gray-500">
                <ol className="list-none p-0 inline-flex flex-wrap">
                  <li className="flex items-center">
                    <a href="#" className="text-blue-600 hover:underline">Home</a>
                    <span className="mx-2">/</span>
                  </li>
                  <li className="text-gray-400" aria-current="page">Washing Jobs</li>
                </ol>
              </nav>
            </div>
          </header>

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            
            {/* Action Bar */}
            <div className="bg-blue-600 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button className="text-white font-semibold text-lg">
                {/* 3. UPDATED: Show count of FILTERED jobs */}
                Jobs ({filteredJobs.length})
              </button>
              <Link href="/WashingServiceNewCard/layout" className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center w-full sm:w-auto">
                <PlusIcon /> Create New Job
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                {/* 4. UPDATED: Connect Input to State */}
                <input
                  type="text"
                  value={searchTerm} // Bind value to state
                  onChange={(e) => setSearchTerm(e.target.value)} // Update state on type
                  placeholder="Search by name or mobile number"
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 bg-teal-500 hover:bg-teal-600 rounded-r-md">
                  <SearchIcon />
                </button>
              </div>
            </div>
            
            {/* Table */}
            <div className="p-4">
              {loading && <p className="text-center text-gray-500 py-4">Loading jobs...</p>}
              {error && <p className="text-center text-red-500 py-4">Error: {error}</p>}

              {!loading && !error && (
                <>
                  {/* Desktop View */}
                  <div className="hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sr.No</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile Number</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* 5. UPDATED: Map over filteredJobs instead of jobs */}
                        {filteredJobs.map((job) => (
                          <tr key={job.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.srNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.mobileNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                <StatusIcon /> {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link href={`/WashingServicesCards/${job.id}`} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                                More info <ArrowRightIcon />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {/* 5. UPDATED: Map over filteredJobs here too */}
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col space-y-3">
                         {/* ... (Mobile card content same as before) ... */}
                         <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-800">{job.srNo}</span>
                          <Link href={`/WashingServicesCards/${job.id}`} className="text-blue-600 hover:underline font-semibold flex items-center text-sm">
                            More info <ArrowRightIcon />
                          </Link>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-semibold text-gray-700">{job.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mobile</p>
                          <p className="font-semibold text-gray-700">{job.mobileNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* 6. UPDATED: Show "No Results" message if filtered list is empty */}
              {!loading && !error && filteredJobs.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {searchTerm ? 'No matching jobs found.' : 'No washing jobs found.'}
                </p>
              )}

            </div>
            
            {/* Pagination Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-start">
                {/* Pagination code... */}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


