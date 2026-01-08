"use client";

import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import AddCustomerModal from '../AddNewCustomer/AddCustomerModal';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';

export default function CustomersPage() {
    const { showAlert, showConfirm } = useAlert();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const tabs = ['All Customers', 'Active', 'Inactive'];
    const [activeTab, setActiveTab] = useState('All Customers');

      const API_URL = process.env.NEXT_PUBLIC_API_URL;


    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/customers`);
            if (response.data.success) {
                console.log('Fetched customers data:', response.data.data); // Check your browser console to see the exact field names (e.g., status vs is_active)
                setCustomers(response.data.data);
            } else {
                showAlert('Failed to load customers', 'error');
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            showAlert('Failed to load customers. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCustomer = async (id) => {
        const confirmed = await showConfirm('Are you sure you want to delete this customer?', 'Delete Customer');
        if (!confirmed) return;
        
        try {
            await axios.delete(`${API_URL}/api/customers/${id}`);
            showAlert('Customer deleted successfully', 'success');
            fetchCustomers(); // Refresh list
        } catch (err) {
            console.error('Error deleting customer:', err);
            showAlert('Failed to delete customer', 'error');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        // 1. Search Logic (Preserves existing search behavior)
        const matchesSearch = (customer.customer_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.customer_name || customer.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.mobile_number.includes(searchTerm);

        // 2. Tab Logic
        if (activeTab === 'All Customers') return matchesSearch;

        // Status Check: Dynamic based on "Repeatedly Visiting"
        // Active = Visited more than once (Returning Customer)
        const visitCount = Number(customer.visit_count || 0);
        const isActive = visitCount > 1; 

        return activeTab === 'Active' ? (matchesSearch && isActive) : (matchesSearch && !isActive);
    });

    const renderTabContent = () => {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customer_name}</td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customer_name || customer.full_name || "Unnamed"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.mobile_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.address || '-'}</td>
                                    {/* Try 'gstin' first, then 'gst_no' (common alternative). Check console for exact name */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.gstin || customer.gst_no || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No customers found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-100">
            <Header />
            <main className="flex flex-col min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-slate-100">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
                        Customers
                    </h1>
                    <nav aria-label="breadcrumb" className="text-sm text-gray-500">
                        <ol className="list-none p-0 inline-flex">
                            <li className="flex items-center">
                                <a href="#" className="text-blue-600 hover:underline">Home</a>
                                <span className="mx-2">/</span>
                            </li>
                            <li className="text-gray-400" aria-current="page">Customers</li>
                        </ol>
                    </nav>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Action Bar */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center">
                        <h2 className="text-white font-semibold">Customer Management</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50"
                        >
                            + Add New Customer
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search by name or mobile number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 p-4">
                        <nav className="flex space-x-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${
                                        activeTab === tab
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading customers...
                        </div>
                    ) : (
                        <div className="p-6">
                            {renderTabContent()}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            
            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchCustomers(); // Refresh list after adding
                }}
            />
        </div>
    );
}
