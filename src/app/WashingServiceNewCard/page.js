



"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Header from "../components/Header";
// 1. Import the validation hooks
import { useFormValidation, FieldError } from '../hooks/useFormValidation';
import { useAlert } from '../context/AlertContext';


// --- Reusable Form Field Component ---
const FormField = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-1.5 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// --- SVG Icon for Chevron Down ---
const ChevronDownIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400 pointer-events-none"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    ></path>
  </svg>
);

export default function NewWashingCardPage() {
  const router = useRouter();
  
  // 2. Define Validation Rules
  const { errors, validate, clearErrors } = useFormValidation({
    vehicle_no: { required: true, message: 'Vehicle No is required' },
    customer_name: { required: true, message: 'Customer Name is required' },
    mobile_number: { required: true, message: 'Mobile Number is required' },
  });
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    vehicle_no: "MH27AB1234",
    make: "",
    model: "",
    customer_name: "",
    mobile_number: "",
  });

  const [loading, setLoading] = useState(false);

  // --- 3. Helper for Red Border Logic ---
  const getInputClass = (fieldName, isSelect = false) => {
    // Base styles common to inputs and selects
    let baseClass = "w-full border rounded-md p-2.5 text-sm focus:outline-none transition duration-150";
    
    // Add appearance-none for select dropdowns to hide default arrow
    if (isSelect) baseClass += " appearance-none bg-white";

    const errorClass = "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50 focus:border-red-500";
    const normalClass = "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 4. Validate before proceeding
    if (!validate(formData)) {
      showAlert('Please correct the errors in the form.', 'error');
      setLoading(false);
      return; 
    }

    // Prepare query string
    const qs = new URLSearchParams({
      vehicle_no: formData.vehicle_no || "",
      make: formData.make || "",
      model: formData.model || "",
      customer_name: formData.customer_name || "",
      mobile_number: formData.mobile_number || "",
    }).toString();

    // Navigate
    router.push(`/WashingServiceNewCard/create/layout?${qs}`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="flex-grow w-full p-4 sm:p-6 lg:p-8 bg-slate-100">
        
        {/* --- Page Header --- */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
              Washing Cards
            </h1>
            <nav aria-label="breadcrumb" className="text-sm text-gray-500">
              <ol className="list-none p-0 inline-flex flex-wrap">
                <li className="flex items-center">
                  <a href="#" className="text-blue-600 hover:underline">Home</a>
                  <span className="mx-2">/</span>
                </li>
                <li className="flex items-center">
                  <a href="#" className="text-blue-600 hover:underline">Washing Cards</a>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-400" aria-current="page">New Washing Card</li>
              </ol>
            </nav>
          </div>
        </header>

        {/* --- Form Card --- */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h2 className="text-lg font-semibold text-white">
              New Washing Card
            </h2>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Vehicle No */}
              <FormField label="Vehicle No." required className="lg:col-span-1">
                <input
                  type="text"
                  name="vehicle_no"
                  value={formData.vehicle_no}
                  onChange={handleChange}
                  className={getInputClass('vehicle_no')}
                />
                <FieldError error={errors.vehicle_no} />
              </FormField>

              {/* Make */}
              <FormField label="Make" className="lg:col-span-1">
                <div className="relative">
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className={getInputClass('make', true)}
                  >
                    <option value="">Select make</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="ford">Ford</option>
                    <option value="maruti">Maruti Suzuki</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDownIcon />
                  </div>
                </div>
              </FormField>

              {/* Model */}
              <FormField label="Model" className="lg:col-span-1">
                <div className="relative">
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className={getInputClass('model', true)}
                  >
                    <option value="">Select model</option>
                    <option value="corolla">Corolla</option>
                    <option value="civic">Civic</option>
                    <option value="ecosport">EcoSport</option>
                    <option value="swift">Swift</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDownIcon />
                  </div>
                </div>
              </FormField>

              {/* Customer Name */}
              <FormField label="Customer Name" required className="lg:col-span-1">
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className={getInputClass('customer_name')}
                />
                <FieldError error={errors.customer_name} />
              </FormField>

              {/* Mobile Number */}
              <FormField label="Mobile Number" required className="sm:col-span-2 lg:col-span-2">
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  className={getInputClass('mobile_number')}
                />
                <FieldError error={errors.mobile_number} />
              </FormField>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-md text-white font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Next"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}