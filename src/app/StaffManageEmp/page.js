

"use client";

import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';
import { useAlert } from '../context/AlertContext';
import { useRouter } from 'next/navigation';

// --- Helper Function to Format Date ---
// MySQL (created_at) -> 02 May 2021 01:11 AM
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
}


// --- SVG Icons (as reusable components) ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// --- Main Page Component ---
export default function UsersPage() {
    const { showAlert, showConfirm } = useAlert();
    // --- State for managing dynamic data ---
    const [users, setUsers] = useState([]);
    
    // --- We still track error/loading to log it, but won't show UI for it ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();



    // --- Fetch data from the API ---
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                
                const data = await response.json();
                setUsers(data); // Set the fetched users into state
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch users:", err);
            } finally {
                setIsLoading(false); // Stop loading, whether success or fail
            }
        };

        fetchUsers();
    }, []); // Empty dependency array means this runs once on mount


    const handleDelete = async (userId) => {
        // 1. Confirm before deleting
        const confirmed = await showConfirm('Are you sure you want to delete this user?', 'Delete User');
        if (!confirmed) return;

        try {
            // 2. Send DELETE request to the backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
                method: 'DELETE',
            });

            // 3. Check for errors
            if (!response.ok) {
                throw new Error('Failed to delete user.');
            }
            
            // 4. Update frontend state to remove the user
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            showAlert('User deleted successfully', 'success');

        } catch (err) {
            console.error('Error deleting user:', err);
            showAlert('Failed to delete user. Please try again.', 'error');
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
                                <li className="text-gray-400" aria-current="page">Users</li>
                            </ol>
                        </nav>
                    </div>
                </header>

                {/* --- Main Content Card --- */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    
                    {/* Action Bar */}
                    <div className="bg-blue-600 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-white font-semibold text-lg">
                            Users (Mechanic)
                        </h2>
                        <Link href="/StaffManageNewEmp/layout" className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center w-full sm:w-auto text-sm">
                            <PlusIcon />
                            Add User
                        </Link>
                    </div>
                    
                    {/* Responsive Table Container */}
                    <div className="p-4 overflow-x-auto">
                        
                        {/* NOTE: Loading and Error messages have been removed 
                          to match the static design. The table will be empty
                          while loading.
                        */}

                        {/* --- Desktop Table View (hidden on small screens) --- */}
                        <div className="hidden lg:block">
                            <table className="min-w-full divide-y divide-gray-200 border">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r">Sr. No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r">User Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r">Email ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r">Mobile Number</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Map over dynamic 'users' state */}
                                    {users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r">
                                                <div>{user.name}</div>
                                                <div className="text-xs text-gray-400">Created: {formatDateTime(user.created_at)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r">{user.mobile_number || 'Not Available'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button 
                                                    onClick={() => router.push(`/StaffManageEmp/edit/${user.id}/layout`)}

                                                    className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600">
                                                        <EditIcon /> Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)}
                                                    className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600">
                                                        <DeleteIcon /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* --- Mobile Card View (hidden on large screens) --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                            {/* Map over dynamic 'users' state */}
                            {users.map((user, index) => (
                                <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-gray-800">#{index + 1}</span>
                                        <span className="text-xs text-gray-400">{formatDateTime(user.created_at)}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">User Name</p>
                                        <p className="font-semibold text-gray-700">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email ID</p>
                                        <p className="font-semibold text-gray-700">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Mobile Number</p>
                                        <p className="font-semibold text-gray-700">{user.mobile || 'Not Available'}</p>
                                    </div>
                                    <div className="border-t pt-3 mt-2 flex items-center justify-start space-x-2">
                                        <Link href={`/StaffManageEmp/edit/${user.id}/layout`} className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600">
                                            <EditIcon /> Edit
                                        </Link>
                                        <button className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600">
                                            <DeleteIcon /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// "use client";

// import React, { useState, useEffect } from 'react';
// import Footer from '../components/Footer';
// import Header from '../components/Header';
// import Link from 'next/link'; // Make sure Link is imported

// // ... (formatDateTime and SVG Icons are unchanged) ...
// function formatDateTime(dateString) {
//     if (!dateString) return 'N/A';
//     try {
//         const date = new Date(dateString);
//         return date.toLocaleString('en-US', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         });
//     } catch (error) {
//         console.error("Error formatting date:", error);
//         return "Invalid Date";
//     }
// }

// const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
// const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
// const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


// // --- Main Page Component ---
// export default function UsersPage() {
//     const [users, setUsers] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await fetch('http://localhost:3001/api/users');
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch data');
//                 }
//                 const data = await response.json();
//                 setUsers(data);
//             } catch (err) {
//                 setError(err.message);
//                 console.error("Failed to fetch users:", err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchUsers();
//     }, []);

//     // --- NEW: Handle Delete Function ---
//     const handleDelete = async (userId) => {
//         // 1. Confirm before deleting
//         if (!window.confirm('Are you sure you want to delete this user?')) {
//             return; // Stop if user clicks "Cancel"
//         }

//         try {
//             // 2. Send DELETE request to the backend
//             const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
//                 method: 'DELETE',
//             });

//             // 3. Check for errors
//             if (!response.ok) {
//                 // If the response is not 204 No Content, throw an error
//                 throw new Error('Failed to delete user.');
//             }
            
//             // 4. Update frontend state to remove the user
//             // This filters the deleted user out of the 'users' array
//             setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

//         } catch (err) {
//             console.error('Error deleting user:', err);
//             showAlert('Failed to delete user. Please try again.');
//         }
//     };

//     return (
//         <div className="flex flex-col min-h-screen w-full bg-slate-100">
//             <Header />
//             <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-slate-100">

//                 {/* --- Page Header --- */}
//                 <header className="mb-6">
//                     {/* ... (header content is unchanged) ... */}
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//                         <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
//                             Users
//                         </h1>
//                         <nav aria-label="breadcrumb" className="text-sm text-gray-500">
//                             <ol className="list-none p-0 inline-flex flex-wrap">
//               . . .
//                             </ol>
//                         </nav>
//                     </div>
//                 </header>

//                 {/* --- Main Content Card --- */}
//                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    
//                     {/* ... (Action Bar is unchanged) ... */}
//                     <div className="bg-blue-600 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
//                         {/* ... */}
//                     </div>
                    
//                     {/* Responsive Table Container */}
//                     <div className="p-4 overflow-x-auto">
                        
//                         {/* ... (Loading and Error states are unchanged) ... */}
//                         {isLoading && <div className="text-center py-8 text-gray-500">Loading users...</div>}
//                         {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

//                         {!isLoading && !error && (
//                             <>
//                                 {/* --- Desktop Table View --- */}
//                                 <div className="hidden lg:block">
//                                     <table className="min-w-full divide-y divide-gray-200 border">
//                                         {/* ... (thead is unchanged) ... */}
//                                         <tbody className="bg-white divide-y divide-gray-200">
//                                             {users.map((user, index) => (
//                                                 <tr key={user.id}>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{index + 1}</td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r">
//                                                         <div>{user.name}</div>
//                                                         <div className="text-xs text-gray-400">Created: {formatDateTime(user.created_at)}</div>
//                                                     </td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r">{user.email}</td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r">{user.mobile || 'Not Available'}</td>
//                                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                                         <div className="flex items-center space-x-2">
                                                            
//                                                             {/* --- MODIFIED: Edit Button --- */}
//                                                             <Link 
//                                                                 href={`/staff/edit/${user.id}`} 
//                                                                 className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600"
//                                                             >
//                                                                 <EditIcon /> Edit
//                                                             </Link>
                                                            
//                                                             {/* --- MODIFIED: Delete Button --- */}
//                                                             <button 
//                                                                 onClick={() => handleDelete(user.id)}
//                                                                 className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
//                                                             >
//                                                                 <DeleteIcon /> Delete
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 {/* --- Mobile Card View --- */}
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
//                                     {users.map((user, index) => (
//                                         <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col space-y-3">
//                                             {/* ... (user info) ... */}
//                                             <div className="flex justify-between items-start">
//                                                 <span className="font-bold text-gray-800">#{index + 1}</span>
//                                                 <span className="text-xs text-gray-400">{formatDateTime(user.created_at)}</span>
//                                             </div>
//                                             <div>
//                 _..._
//                                             </div>

//                                             <div className="border-t pt-3 mt-2 flex items-center justify-start space-x-2">
                                                
//                                                 {/* --- MODIFIED: Edit Button --- */}
//                                                 <Link 
//                                                     href={`/staff/edit/${user.id}`}
//                                                     className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600"
//                                                 >
//                                                     <EditIcon /> Edit
//                                                 </Link>

//                                                 {/* --- MODIFIED: Delete Button --- */}
//                                                 <button 
//                                                     onClick={() => handleDelete(user.id)}
//                                                     className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
//                                                 >
//                                                     <DeleteIcon /> Delete
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 {/* ... (No users found message) ... */}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             <Footer />
//         </div>
//     );
// }