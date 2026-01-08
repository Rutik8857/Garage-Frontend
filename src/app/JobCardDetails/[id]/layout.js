"use client";

import React, { useState, useEffect } from "react";
import Axios from "axios";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAlert } from "@/app/context/AlertContext";

// -------- Reusable Form Field --------
const FormField = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-1.5 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// -------- Page Component --------
export default function JobCardDetailsPage({ params }) {
  const { showAlert } = useAlert();
  const id = params?.id; // ✅ correct

  const [formData, setFormData] = useState({
    vehicleNo: "",
    make: "",
    model: "",
    customerName: "",
    mobileNumber: "",
    estimate: "",
    customerVoice: "",
    status: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------- Fetch Job Card --------
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchJobCard = async () => {
      try {
        setIsLoading(true);
        const response = await Axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobcards/${id}`
        );

        if (response.data.success) {
          const data = response.data.data;
          setFormData({
            vehicleNo: data.vehicle_no || "",
            make: data.make || "",
            model: data.model || "",
            customerName: data.customer_name || "",
            mobileNumber: data.mobile_number || "",
            estimate: data.estimate || "",
            customerVoice: data.customer_voice || "",
            status: data.status || "pending",
          });
        } else {
          setError("Job card not found.");
        }
      } catch (err) {
        console.error("Error fetching job card:", err);
        setError("Failed to fetch job card details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCard();
  }, [id]);

  // -------- Input Change (read-only safe) --------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------- Back Button --------
  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  // -------- States --------
  if (!id)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No job card selected.
      </div>
    );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  // -------- UI --------
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Job Card Details
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ID: MC-2021-{id}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                formData.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : formData.status === "closed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {formData.status}
            </span>
          </div>

          {/* Form */}
          <div className="p-6">
            <form>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField label="Vehicle No." required>
                  <input
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>

                <FormField label="Make">
                  <input
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>

                <FormField label="Model">
                  <input
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>

                <FormField label="Estimate Cost">
                  <input
                    name="estimate"
                    value={formData.estimate}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>

                <FormField label="Customer Name" required className="sm:col-span-2">
                  <input
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>

                <FormField label="Mobile Number" required className="sm:col-span-2">
                  <input
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>

                <FormField
                  label="Customer Voice / Complaint"
                  className="sm:col-span-4"
                >
                  <textarea
                    name="customerVoice"
                    rows="4"
                    value={formData.customerVoice}
                    onChange={handleChange}
                    readOnly
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </FormField>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border rounded-md"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md"
                  onClick={() => showAlert("Update functionality later")}
                >
                  Update Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
