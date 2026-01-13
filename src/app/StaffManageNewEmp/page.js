


"use client";

import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';
// import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';

// --- Reusable Form Field Component ---
const FormField = ({ label, type = 'text', name, value, onChange, required = false }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1.5 text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
        />
    </div>
);

// --- SVG Icon ---
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-6a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
); 

export default function AddUserPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile_number: '',
        password: '',
        confirmPassword: '',
    });

    // 1. NEW: State for Image
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Add new state for loading and messages
    const [isLoading, setIsLoading] = useState(false);
    const { showAlert } = useAlert();



    // Cleanup preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. NEW: Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsLoading(true);

        // Client-side password check
        if (formData.password !== formData.confirmPassword) {
            showAlert('Passwords do not match.', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            let body;
            let headers = {};

            if (imageFile) {
                const payload = new FormData();
                Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
                payload.append('profile_image', imageFile);
                body = payload;
            } else {
                body = JSON.stringify(formData);
                headers['Content-Type'] = 'application/json';
            }

            // Update the URL to use port 3001
            const response = await fetch(`${apiUrl}/api/users`, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            // Check if the response is actually JSON before trying to parse it
            const contentType = response.headers.get("content-type");
            
            if (response.ok && contentType && contentType.includes("application/json")) {
                // --- SUCCESS CASE ---
                // We got JSON and a 2xx status
                const data = await response.json();
                showAlert(`${data.message} The new user can now log in with their credentials.`, 'success');
                // Optionally reset form
                setFormData({
                    name: '', email: '', mobile_number: '', password: '', confirmPassword: ''
                });
                setImageFile(null);
                setPreviewUrl(null);
            } else if (!response.ok) {
                // --- ERROR CASE (4xx, 5xx) ---
                // The server responded with an error. Let's see if it's JSON or HTML.
                if (contentType && contentType.includes("application/json")) {
                    // It's a JSON error, which is good.
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'An unknown error occurred');
                } else {
                    // It's not JSON. This is the "Unexpected token '<'" error.
                    // Let's read it as text and log it.
                    const errorText = await response.text();
                    console.error("Server returned non-JSON error (see HTML below):", errorText);
                    // This is the error the user sees
                    throw new Error('Server returned an invalid response. Check console for details.');
                }
            }

        } catch (err) {
            // This catches:
            // 1. Network errors (fetch itself fails)
            // 2. Errors we threw manually (like the one above)
            console.error("Full handleSubmit error:", err);
            
            // Show a user-friendly error
            if (err.message.includes('Failed to fetch')) {
                showAlert('Network error. Is the backend server running on port 3001?', 'error');
            } else if (err.message.includes('invalid response')) {
                showAlert(err.message, 'error'); // Our custom error
            } else {
                showAlert(err.message, 'error'); // All other errors
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-100">
            <Header />
            <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-slate-100">
                
                {/* --- Page Header --- */}
                <header className="mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
                            Users
                        </h1>
                        <nav aria-label="breadcrumb" className="text-sm text-gray-500">
                            <ol className="list-none p-0 inline-flex flex-wrap">
                                <li className="flex items-center">
                                    <a href="#" className="text-blue-600 hover:underline">Home</a>
                                    <span className="mx-2">/</span>
                                </li>
                                <li className="flex items-center">
                                    <Link href="/StaffManageEmp/layout" className="text-blue-600 hover:underline">Users</Link>
                                    <span className="mx-2">/</span>
                                </li>
                                <li className="text-gray-400" aria-current="page">Add User</li>
                            </ol>
                        </nav>
                    </div>
                </header>

                {/* --- Main Content Card --- */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    
                    {/* Action Bar */}
                    <div className="bg-blue-600 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-white font-semibold text-lg">
                            Add New User (Mechanic)
                        </h2>
                        <Link href="/StaffManageEmp/layout" className="text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm">
                            <UsersIcon />
                            Users
                        </Link>
                    </div>
                    
                    {/* Form Container */}
                    <form onSubmit={handleSubmit} className="p-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Name" name="name" value={formData.name} onChange={handleChange} required />
                            <FormField label="Email address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                            <FormField label="Mobile Number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} />
                            <FormField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
            
                            <FormField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />


                        <div className="flex flex-col">
                                <label className="mb-1.5 text-sm font-medium text-gray-700">
                                    Profile Image
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-slate-500
                                          file:mr-4 file:py-2.5 file:px-4
                                          file:rounded-md file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-blue-50 file:text-blue-700
                                          hover:file:bg-blue-100
                                          border border-gray-300 rounded-md
                                          cursor-pointer"
                                    />
                                    {previewUrl && (
                                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading} // Disable button while loading
                                className="px-6 py-2.5 rounded-md text-white font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
