


"use client";
import { useState } from 'react';
import axios from 'axios'; // Import axios

// --- Helper Icon/Components (Unchanged) ---
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FormField = ({ label, required, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const StyledInput = (props) => (
  <input
    {...props}
    className="block w-full border-0 border-b-2 border-gray-400 bg-transparent px-1 py-2 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-0"
  />
);

// --- MODIFIED Component ---

export default function AddCustomerModal({ isOpen, onClose }) {
  // --- MODIFIED: Added mobileNumber state ---
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState(''); // <-- NEW
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');

  // --- NEW: State for loading and errors ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) {
    return null;
  }

  // --- MODIFIED: handleSubmit to send data to backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const customerData = {
      fullName,
      mobileNumber, // <-- NEW
      address,
      gstin,
    };

    try {
      // Send data to the backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, customerData);

      if (response.data.success) {
        // Reset form
        setFullName('');
        setMobileNumber('');
        setAddress('');
        setGstin('');
        setLoading(false);
        onClose(); // Close the modal
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setError(errMsg);
      setLoading(false);    
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-lg shadow-xl z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b rounded-t">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Customer
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <CloseIcon />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <FormField label="Full Name" required>
              <StyledInput
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </FormField>

            {/* --- NEW: Mobile Number Field --- */}
            <FormField label="Mobile Number" required>
              <StyledInput
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Address">
              <StyledInput
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormField>

            <FormField label="GSTIN">
              <StyledInput
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
              />
            </FormField>

            {/* --- NEW: Error Display --- */}
            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}