"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';
// Use environment variable in a real app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const StatusSelector = ({ jobId, currentStatus, onStatusChange }) => {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (e) => {
        e.stopPropagation(); // Prevent row click when changing status
        const newStatus = e.target.value;
        setIsUpdating(true);
        setStatus(newStatus);
        try {
            await Axios.put(`${API_BASE_URL}/api/washing-jobs/${jobId}/status`, { status: newStatus });
            if(onStatusChange) onStatusChange(jobId, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert('Failed to update status.');
            setStatus(currentStatus); // Revert on failure
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100';
        }
    };

    return (
        <select
            value={status}
            onChange={handleStatusUpdate}
            onClick={(e) => e.stopPropagation()}
            disabled={isUpdating}
            className={`text-sm font-medium px-2.5 py-1 rounded-full appearance-none focus:outline-none ${isUpdating ? 'cursor-not-allowed opacity-50' : ''} ${getStatusColor(status)}`}
        >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
        </select>
    );
};

export default function JobWashingListPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await Axios.get(`${API_BASE_URL}/api/washing-jobs`);
                if (response.data.success) {
                    setJobs(response.data.data);
                } else {
                    throw new Error('Failed to fetch washing jobs');
                }
            } catch (err) {
                setError(err.message || "Could not connect to the server.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleStatusChange = (jobId, newStatus) => {
        setJobs(currentJobs =>
            currentJobs.map(job =>
                job.id === jobId ? { ...job, status: newStatus } : job
            )
        );
    };

    const handleRowClick = (jobId) => {
        // Navigate to the frontend page for the washing job (not the backend API URL)
        router.push(`/washing-jobs/${jobId}/layout`);
    };

    const filteredJobs = jobs.filter(job => {
        const name = job.customerName || '';
        const mobile = job.mobileNumber || '';
        const vehicle = job.vehicleNumber || '';
        const term = searchTerm.toLowerCase();
        return name.toLowerCase().includes(term) || mobile.toLowerCase().includes(term) || vehicle.toLowerCase().includes(term);
    });

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-100">
            <Header />
            <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <header className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Washing Jobs</h1>
                        <div className="text-sm text-gray-500">
                            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
                            <span className="mx-2">/</span>
                            <span>Washing Jobs</span>
                        </div>
                    </header>

                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                            <h2 className="font-bold">Jobs ({filteredJobs.length})</h2>
                            <button
                                onClick={() => router.push('/WashingServiceNewCard')}
                                className="flex items-center bg-white text-blue-600 text-sm font-semibold px-3 py-1.5 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
                            >
                                <PlusIcon />
                                Create New Job
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name, mobile, or vehicle no"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                                    <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        <SearchIcon />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-red-500">Error: {error}</td></tr>
                                    ) : filteredJobs.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4">No jobs found.</td></tr>
                                    ) : (
                                        filteredJobs.map((job) => (
                                            <tr key={job.id} onClick={() => handleRowClick(job.id)} className="hover:bg-gray-100 cursor-pointer">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{job.srNo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.customerName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.vehicleNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.mobileNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <StatusSelector
                                                        jobId={job.id}
                                                        currentStatus={job.status}
                                                        onStatusChange={handleStatusChange}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
