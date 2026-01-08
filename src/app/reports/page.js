"use client";

import { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useRouter } from "next/navigation";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-gray-400"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function ReportsAndSearch() {
  const [duration, setDuration] = useState('09/28/2025 - 09/28/2025');
  const [customerName, setCustomerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Use environment variable for API base URL for production readiness
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();



  const handleApiError = (err, context) => {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Server responded with a status code outside the 2xx range
        console.error(`API Error Response (${context}):`, err.response.data);
        const status = err.response.status;
        
        // Prioritize the detailed 'error' message from the backend if it exists
        const detailedError = err.response.data?.error;
        const genericMessage = err.response.data?.message;
        let displayMessage = detailedError || genericMessage || 'An unexpected server error occurred.';

        if (status === 404) {
          setError(`API endpoint not found. Please check the API server and URL.`);
        } else if (status === 400) {
          setError(`Invalid request: ${displayMessage}`);
        } else {
          setError(`Server Error (${status}): ${displayMessage}`);
        }
      } else if (err.request) {
        // Request was made but no response was received
        console.error(`API No Response (${context}):`, err.request);
        setError('Network error: Could not reach the server. Please check your connection and ensure the backend is running.');
      } else {
        // Something happened in setting up the request
        console.error(`API Request Setup Error (${context}):`, err.message);
        setError(`An error occurred while preparing the request: ${err.message}`);
      }
    } else {
      // Non-Axios error
      console.error(`Unexpected Error (${context}):`, err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearchAttempted(true);
    setResults([]);

    try {
      const filters = { customerName, vehicleNumber, mobileNumber, duration };
      const response = await axios.post(`${API_BASE_URL}/api/reports/search`, filters);
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message || 'Search failed. Please try again.');
      }
    } catch (err) {
      handleApiError(err, 'searching');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExcelDownload = async () => {
    setLoading(true);
    setError('');
    
    try {
      // const filters = { customerName, vehicleNumber, mobileNumber, duration };
      const filters = {
  customerName,
  vehicleNumber,
  mobileNumber,
  ...(duration ? { duration } : {})
};
      const response = await axios.post(`${API_BASE_URL}/api/reports/download`, filters, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'JobCardReport.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      handleApiError(err, 'downloading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <main className="flex-grow bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Reports & Search</h1>
            <nav className="text-sm text-gray-500 mt-2 md:mt-0">
              <Link href="/" className="text-blue-600 hover:underline">Home</Link>
              <span className="mx-2">/</span>
              <span>Reports & Search</span>
            </nav>
          </header>

          <div className="bg-blue-600 p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold text-white">Filter & Download</h2>
          </div>
            
          <div className="bg-white p-6 rounded-b-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-grow">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon />
                  </div>
                  <input
                    type="text"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleExcelDownload}
                disabled={loading}
                className="w-full md:w-auto bg-red-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors self-end disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Downloading...' : 'Download Excelsheet (.xls)'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-1">
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                    Customer name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                   <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="mt-6">
            {loading && <LoadingSpinner />}
            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200">{error}</div>}
            
            {!loading && !error && searchAttempted && results.length === 0 && (
              <div className="p-4 bg-white text-center rounded-lg shadow-sm border border-gray-200">
                  <p className="text-gray-600">No records found matching your criteria.</p>
              </div>
            )}
            
            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((job) => (
                  <div key={job.id}
                  onClick={() => router.push(`/JobCardList/${job.id}/layout`)}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{job.customer_name}</h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block mb-3">{job.vehicle_no}</p>
                      <div className="space-y-2 text-gray-700">
                        <p className="flex items-center"><strong className="w-24">Job ID:</strong> MC-{job.id}</p>
                        <p className="flex items-center"><strong className="w-24">Mobile:</strong> {job.mobile_number}</p>
                        <p className="flex items-center"><strong className="w-24">Date:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
                        <p className="flex items-center font-semibold text-lg text-blue-600"><strong className="w-24 text-gray-700 font-semibold text-base">Estimate:</strong> Rs. {parseFloat(job.estimate).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
