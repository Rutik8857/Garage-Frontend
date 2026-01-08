


'use client';
import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Axios from 'axios';
import { useAlert } from '../context/AlertContext';

// --- (Icons are unchanged) ---
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-gray-400"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2 h-4 w-4"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// --- NEW: Close Icon for Modal ---
const CloseIcon = () => (
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
    className="h-6 w-6"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- NEW: Reusable FormField component for clean layout ---
const FormField = ({ label, required, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// --- NEW: Reusable StyledInput for consistent styling ---
const StyledInput = (props) => (
  <input
    {...props}
className="block w-full border-0 border-b-2 border-gray-700 bg-transparent px-3 py-2 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-0"  />
);

// --- NEW: Reusable CategoryRadio for the button group ---
const CategoryRadio = ({ value, label, checked, onChange, required }) => (
  <label
    className={`flex cursor-pointer items-center justify-center rounded-md border py-2 px-3 text-sm font-medium transition ${
      checked
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
    }`}
  >
    <input
      type="radio"
      name="category"
      value={value}
      checked={checked}
      onChange={onChange}
      className="sr-only"
      required={required}
    />
    <span>{label}</span>
  </label>
);

// --- MODIFIED: Modal Component is now fully functional ---
const AddStockModal = ({ onClose, refreshData, initialData = null, showAlert }) => {
  // State for form fields (Unchanged)
  const [formData, setFormData] = useState({
    productName: '',
    make: '',
    model: '',
    variant: '',
    unitPrice: '',
    stock: 0,
    category: '', // Use a single string for category
  });

  // When `initialData` changes (edit mode), populate the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.product_name || '',
        make: initialData.make || '',
        model: initialData.model || '',
        variant: initialData.variant || '',
        unitPrice: initialData.unit_price || '',
        stock: initialData.stock || 0,
        category: initialData.category || '',
      });
    } else {
      // clear when opening in add mode
      setFormData({
        productName: '',
        make: '',
        model: '',
        variant: '',
        unitPrice: '',
        stock: 0,
        category: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map formData to backend field names expected by the controller
      // The server expects camelCase keys: productName, unitPrice, etc.
      const payload = {
        productName: formData.productName,
        make: formData.make,
        model: formData.model,
        variant: formData.variant,
        unitPrice: Number(formData.unitPrice) || 0,
        stock: Number(formData.stock) || 0,
        category: formData.category,
      };

      let response;
      if (initialData && initialData.id) {
        // Edit
        response = await Axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/stock/${initialData.id}`,
          payload
        );
      } else {
        // Add
        response = await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/stock`, payload);
      }

      if (response.data.success) {
        showAlert(response.data.message || 'Saved successfully', 'success');
        refreshData(); // Refresh the data in the main table
        onClose(); // Close modal
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Failed to add item. Please try again.';
      showAlert(`Error: ${errMsg}`, 'error');
      console.error(error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* --- MODIFIED: Modal container with new layout --- */}
      <div
        className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- NEW: Modal Header --- */}
        <div className="flex items-start justify-between p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900">
            Add New Stock Item
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <CloseIcon />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* --- MODIFIED: Form with new components --- */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <FormField label="Product name" required>
              <StyledInput
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Make">
                <StyledInput
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Model">
                <StyledInput
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <FormField label="Variant">
              <StyledInput
                type="text"
                name="variant"
                value={formData.variant}
                onChange={handleChange}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Unit Price" required>
                <StyledInput
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </FormField>
              <FormField label="Stock">
                <StyledInput
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                />
              </FormField>
            </div>

            {/* --- MODIFIED: Category Radio Button Group --- */}
            <FormField label="Choose Category" required>
              <div className="grid grid-cols-3 gap-3 mt-1.5">
                <CategoryRadio
                  label="Job"
                  value="job"
                  checked={formData.category === 'job'}
                  onChange={handleCategoryChange}
                  required
                />
                <CategoryRadio
                  label="Spare"
                  value="spare"
                  checked={formData.category === 'spare'}
                  onChange={handleCategoryChange}
                  required
                />
                <CategoryRadio
                  label="Oil"
                  value="oil"
                  checked={formData.category === 'oil'}
                  onChange={handleCategoryChange}
                  required
                />
              </div>
            </FormField>
          </div>

          {/* --- NEW: Modal Footer --- */}
          <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MODIFIED: Main component is now fully dynamic ---
// (This component's logic is unchanged, only the modal it calls is different)
export default function JobsStockPage() {
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('job'); // Use 'job', 'spare', 'oil'
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // State for each category of data
  const [jobsData, setJobsData] = useState([]);
  const [sparesData, setSparesData] = useState([]);
  const [oilsData, setOilsData] = useState([]);

  // Fetch all data from the backend
  const fetchData = async () => {
    try {
      // Fetch jobs
      const jobsRes = await Axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=job`
      );
      if (jobsRes.data.success) setJobsData(jobsRes.data.data);

      // Fetch spares
      const sparesRes = await Axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=spare`
      );
      if (sparesRes.data.success) setSparesData(sparesRes.data.data);

      // Fetch oils
      const oilsRes = await Axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=oil`
      );
      if (oilsRes.data.success) setOilsData(oilsRes.data.data);
    } catch (error) {
      // Detailed Axios error handling
      if (error.response) {
        console.error('Fetch stock response error data:', error.response.data);
        console.error('Fetch stock response status:', error.response.status);
      } else if (error.request) {
        console.error('Fetch stock no response, request:', error.request);
      } else {
        console.error('Fetch stock setup error:', error.message);
      }
      // Keep the user informed in dev - use console and optional alert
      // (Avoid intrusive alerts in production)
      console.error('Failed to fetch stock data. See details above.');
    }
  };

  // Fetch data on component load
  useEffect(() => {
    fetchData();
  }, []);

  const dataMap = {
    job: jobsData,
    spare: sparesData,
    oil: oilsData,
  };

  const activeData = dataMap[activeTab];

  const tabs = [
    { id: 'job', label: 'Jobs', count: jobsData.length },
    { id: 'spare', label: 'Spares', count: sparesData.length },
    { id: 'oil', label: 'Oils', count: oilsData.length },
  ];

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this item?', 'Delete Item');
    if (!confirmed) return;

    try {
      const response = await Axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock/${id}`
      );
      if (response.data.success) {
        showAlert(response.data.message, 'success');
        fetchData(); // Refresh data after delete
      }
    } catch (error) {
      if (error.response) {
        console.error('Delete response error data:', error.response.data);
        console.error('Delete response status:', error.response.status);
        showAlert(`Error: ${error.response.data?.message || 'Server error.'}`, 'error');
      } else if (error.request) {
        console.error('Delete no response, request:', error.request);
        showAlert('No response from server. Please check your network or backend.', 'error');
      } else {
        console.error('Delete setup error:', error.message);
        showAlert(`Error: ${error.message}`, 'error');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* ... (Header Section is unchanged) ... */}

          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-t-lg bg-blue-600 p-4 sm:flex-row sm:items-center">
            <nav className="flex" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-center text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700'
                      : 'text-white hover:bg-blue-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-50"
            >
              <PlusIcon />
              Add New Jobs, Spare & Oil
            </button>
          </div>

          <div className="overflow-x-auto rounded-b-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sr. No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Make/Model/Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {activeData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.product_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-800">
                      {[item.make, item.model, item.variant]
                        .filter(Boolean)
                        .join('/') || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.stock}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      Rs. {Number(item.unit_price).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setIsModalOpen(true);
                        }}
                        className="mr-2 rounded bg-teal-500 px-3 py-1 text-white hover:bg-teal-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ... (Pagination Section is unchanged) ... */}
        </div>
        {isModalOpen && (
          <AddStockModal
            onClose={() => {
              setIsModalOpen(false);
              setEditItem(null);
            }}
            refreshData={fetchData} // Pass the refresh function
            initialData={editItem}
            showAlert={showAlert}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}