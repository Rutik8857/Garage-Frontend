



"use client"; // <-- IMPORTANT: Make this a client component

// Import React hooks: useState and useEffect
import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAlert } from '../context/AlertContext';
// import Header from '../components/Header'; // Assuming path is '@/components/Header'
// import Footer from '../components/Footer'; // Assuming path is '@/components/Footer'
// import Link from 'next/link'; // Commented out to resolve build error

// API URL for fetching and deleting SMS records
const API_URL =  `${process.env.NEXT_PUBLIC_API_URL}/api/sms`;

// Reusable Icon components for the Actions column
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 hover:text-blue-700" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 hover:text-red-700" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);


const SmsListPage = () => {
  const { showAlert, showConfirm } = useAlert();
  // --- NEW: State for data, loading, and errors ---
  const [smsList, setSmsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Function to fetch data ---
  const fetchSmsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      if (result.success) {
        setSmsList(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      // Use err.message to get the error string
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Fetch data on component mount ---
  useEffect(() => {
    fetchSmsList();
  }, []); // Empty dependency array means this runs once on mount

  // --- NEW: Function to handle delete ---
  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this SMS?', 'Delete SMS');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the list by removing the item from state
        setSmsList(currentList => currentList.filter(item => item.srNo !== id));
        showAlert(result.message, 'success');
      } else {
        throw new Error(result.message || 'Failed to delete SMS');
      }
    } catch (err) {
      setError(err.message);
      showAlert(`Error: ${err.message}`, 'error');
    }
  };

  return (
    // Main container with a light gray background
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      {/* <Header /> */}
      <Header />
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* 1. Header with Title and Breadcrumbs */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
            <h1 className="text-3xl font-bold text-gray-800">
              SMS Marketing
            </h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline">Home</a>
              <span className="mx-2">/</span>
              <span>SMS</span>
            </nav>
          </header>

          {/* 2. Main Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            
            {/* Blue Action Bar - FIXED HREF */}
            <div className="bg-blue-600 text-white flex justify-between items-center p-4">
              <h2 className="text-lg font-semibold">SMS List</h2>
              {/* This Link now correctly points to your "Send SMS" page */}
              {/* Replaced <Link> with <a> to fix build error */}
              <a href="/SMS/layout" className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                <span className="text-lg font-bold">+</span>
                <span>Send SMS</span>
              </a>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Sr. No</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Reminder Datetime</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Message</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* --- DYNAMIC DATA RENDERING --- */}
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-red-500">
                        Error: {error}
                      </td>
                    </tr>
                  ) : smsList.length > 0 ? (
                    smsList.map((item) => (
                      <tr key={item.srNo} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{item.srNo}</td>
                        <td className="px-6 py-4">{item.datetime}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={item.message}>{item.message}</td>
                        <td className="px-6 py-4">{item.customer}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-3">
                              {/* Edit button is not wired up yet */}
                              {/* <button className="p-1" aria-label="Edit" title="Edit (Not Implemented)">
                                <EditIcon />
                              </button> */}
                              {/* Delete button is now wired up */}
                              <button 
                                className="p-1" 
                                aria-label="Delete" 
                                title="Delete"
                                onClick={() => handleDelete(item.srNo)}
                              >
                                <DeleteIcon />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : ( 
                    // Empty state when there is no data
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        No SMS records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
      <Footer />
    </div>
  );
};

export default SmsListPage;