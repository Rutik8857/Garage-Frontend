





"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Axios from "axios";
import { useAlert } from "../context/AlertContext";
import { useFormValidation, FieldError } from "../hooks/useFormValidation";

// --- Components ---

const FormField = ({ label, required, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-1.5 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// --- Main Job Card Component ---

export default function JobCardForm() {
  const { showAlert } = useAlert();
  // 1. State for Step Management (1 = Details, 2 = Items, 3 = Finalize)
  const [currentStep, setCurrentStep] = useState(1);

  // Form validation rules
  const { errors, validate, clearErrors } = useFormValidation({
    vehicleNo: { required: true, message: "Vehicle No is required" },
    make: { required: true, message: "Make is required" },
    runningKm: { required: true, message: "Running KM is required" },
    customerName: { required: true, message: "Customer Name is required" },
    mobileNumber: { required: true, message: "Mobile Number is required" },
  });

  // Helper to get input classes based on error state
  const getInputClass = (fieldName) => {
    const baseClass =
      "w-full border rounded-md p-2 text-sm focus:ring-2 focus:outline-none transition-colors";
    const errorClass = "border-red-500 focus:ring-red-200 bg-red-50"; // Red border & light red bg
    const normalClass =
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  // 2. Combined Form Data (Vehicle + Final Details)
  const [formData, setFormData] = useState({
    // Step 1 Data
    vehicleNo: "",
    make: "",
    model: "",
    runningKm: "",
    customerName: "",
    mobileNumber: "",
    estimate: "0",
    serviceOption: "servicing",
    customerVoice: "",
    // Step 3 Data (New)
    deliveryDate: "",
    deliveryTime: "",
    mechanic: "Shri Garage", // Default value
    advanceAmount: "0",
    reminder1: '', 
    reminder2: '',
    completionDateTime: '',
  });

  // 3. State for Step 2: Item Selection
  const [activeTab, setActiveTab] = useState("Jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  // Initialize Date/Time with current values on mount
  useEffect(() => {
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      deliveryDate: now.toISOString().split("T")[0], // YYYY-MM-DD
      deliveryTime: now.toTimeString().split(" ")[0].slice(0, 5), // HH:MM
    }));
  }, []);

  // --- Mock Data ---
  const inventoryData = {
    Jobs: [
      { id: 101, name: "Washing", price: 450, availQty: -4 },
      { id: 102, name: "General Servicing", price: 1500, availQty: -6 },
      { id: 103, name: "Wheel Alignment", price: 350, availQty: 0 },
      { id: 104, name: "Oil Change Labor", price: 200, availQty: 0 },
    ],
    Spare: [
      { id: 201, name: "Brake Pad", price: 800, availQty: 10 },
      { id: 202, name: "Oil Filter", price: 150, availQty: 25 },
    ],
    Oils: [
      { id: 301, name: "Engine Oil 1L", price: 400, availQty: 50 },
      { id: 302, name: "Coolant", price: 200, availQty: 20 },
    ],
  };

  const mechanicsList = ["Shri Garage", "Mechanic 1", "Mechanic 2"];

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Optional: Clear error when user types
    if (errors[name]) {
      // You might need a clearFieldError function in your hook,
      // or just clear all errors on submit.
      // For now, validation runs on 'Next' click.
    }
  };

  // Move to Next Step
  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      // Validate Step 1 Fields explicitly
      // Create a temporary object with only step 1 fields to validate
      const step1Data = {
        vehicleNo: formData.vehicleNo,
        make: formData.make,
        runningKm: formData.runningKm,
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
      };

      if (!validate(step1Data)) {
        showAlert("Please fill in all required fields marked in red.", "error");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validation for Step 2 (Optional: Force at least one item?)
      setCurrentStep(3);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setCurrentStep((prev) => prev - 1);
  };

  // Add Item
  const handleSelectItem = (item) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);
    if (existingItem) {
      const updatedItems = selectedItems.map((i) =>
        i.id === item.id
          ? { ...i, needQty: i.needQty + 1, total: (i.needQty + 1) * i.price }
          : i
      );
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([
        ...selectedItems,
        { ...item, needQty: 1, total: item.price },
      ]);
    }
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  // Change Qty
  const handleQtyChange = (id, newQty) => {
    const qty = parseInt(newQty) || 0;
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id
          ? { ...item, needQty: qty, total: qty * item.price }
          : item
      )
    );
  };

  // Final Submit
  const handleSubmit = async () => {
    // Validate required fields again just in case
    if (!validate(formData)) {
      showAlert("Please fill all required fields", "error");
      setCurrentStep(1); // Go back to step 1 to fill required fields
      return;
    }

    const finalPayload = {
      ...formData,
      items: selectedItems,
    };

    console.log("Submitting Final Data:", finalPayload);

    try {
      const response = await Axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobcards`,
        finalPayload
      );
      if (response.data.success) {
        showAlert(response.data.message, "success");
        clearErrors();
        // Reset everything
        setFormData({
          vehicleNo: "",
          make: "",
          model: "",
          runningKm: "",
          customerName: "",
          mobileNumber: "",
          estimate: "0",
          serviceOption: "servicing",
          customerVoice: "",
          deliveryDate: "",
          deliveryTime: "",
          mechanic: "Shri Garage",
          advanceAmount: "0",
        });
        setSelectedItems([]);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Error", error);
      showAlert("Failed to create job card. Check console.", "error");
    }
  };

  // Filter Inventory
  const filteredInventory = inventoryData[activeTab].filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Title Helper
  const getTitle = () => {
    if (currentStep === 1) return "New Job Card - Details";
    if (currentStep === 2) return "New Job Card - Add Items";
    return "New Job Card - Finalize";
  };

  return (
    <>
      <div className="flex flex-col w-full min-h-screen bg-slate-100">
        <Header />
        <main className="bg-gray-50 min-h-screen font-sans">
          <div className="container mx-auto px-4 py-8">
            {/* Top Header Area */}
            <div className="flex flex-col mb-6 sm:flex-row justify-between items-start sm:items-center">
              <h1 className="text-2xl font-bold text-gray-800">{getTitle()}</h1>
              <nav
                aria-label="breadcrumb"
                className="text-sm text-gray-500 mt-2 sm:mt-0"
              >
                <ol className="list-none p-0 inline-flex flex-wrap">
                  <li className="flex items-center">
                    <a href="#" className="text-blue-600 hover:underline">
                      Home
                    </a>
                  </li>
                  <li className="flex items-center">
                    <Link
                      href="/JobCardList"
                      className="text-blue-600 hover:underline mx-2"
                    >
                      Job Cards
                    </Link>
                  </li>
                  <li className="text-gray-400">/ Step {currentStep}</li>
                </ol>
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 p-4">
                <h2 className="text-lg font-semibold text-white">
                  {currentStep === 1 && "Enter Job Details"}
                  {currentStep === 2 && "Select Spare Parts & Services"}
                  {currentStep === 3 && "Final Details"}
                </h2>
              </div>

              {/* ================= STEP 1: JOB DETAILS FORM ================= */}
              {currentStep === 1 && (
                <form className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField label="Vehicle No." required>
                      <input
                        type="text"
                        name="vehicleNo"
                        value={formData.vehicleNo}
                        onChange={handleChange}
                        className={getInputClass("vehicleNo")}
                      />
                      <FieldError error={errors.vehicleNo} />
                    </FormField>
                    <FormField label="Make" required>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        className={getInputClass("make")}
                      />
                      <FieldError error={errors.make} />
                    </FormField>
                    <FormField label="Model">
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className={getInputClass("model")}
                      />
                    </FormField>
                    <FormField label="Running KM" required>
                      <input
                        type="number"
                        name="runningKm"
                        value={formData.runningKm}
                        onChange={handleChange}
                        className={getInputClass("runningKm")}
                      />
                      <FieldError error={errors.runningKm} />
                    </FormField>
                    <FormField label="Customer Name" required>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className={getInputClass("customerName")}
                      />
                      <FieldError error={errors.customerName} />
                    </FormField>
                    <FormField label="Mobile Number" required>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className={getInputClass("mobileNumber")}
                      />
                      <FieldError error={errors.mobileNumber} />
                    </FormField>
                    <FormField
                      label="Service Type"
                      required
                      className="sm:col-span-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 h-full pt-1">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="serviceOption"
                            value="servicing"
                            checked={formData.serviceOption === "servicing"}
                            onChange={handleChange}
                            className="form-radio text-blue-600"
                          />
                          <span className="text-sm ml-2">Servicing</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="serviceOption"
                            value="repair"
                            checked={formData.serviceOption === "repair"}
                            onChange={handleChange}
                            className="form-radio text-blue-600"
                          />
                          <span className="text-sm ml-2">Repair</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="serviceOption"
                            value="both"
                            checked={formData.serviceOption === "both"}
                            onChange={handleChange}
                            className="form-radio text-blue-600"
                          />
                          <span className="text-sm ml-2">Both</span>
                        </label>
                      </div>
                    </FormField>
                    <FormField label="Estimate" required>
                      <input
                        type="number"
                        name="estimate"
                        value={formData.estimate}
                        onChange={handleChange}
                        className={getInputClass("estimate")}
                      />
                    </FormField>
                    <FormField
                      label="Customer Voice"
                      className="sm:col-span-2 lg:col-span-4"
                    >
                      <textarea
                        name="customerVoice"
                        rows="4"
                        value={formData.customerVoice}
                        onChange={handleChange}
                        className={getInputClass("customerVoice")}
                      ></textarea>
                    </FormField>
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 gap-4">
                    <button
                      onClick={handleNext}
                      className="px-8 py-2.5 rounded-md text-white font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      Next <span className="text-xl">→</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ================= STEP 2: ITEM SELECTION ================= */}
              {currentStep === 2 && (
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT: Choose Items */}
                    <div className="w-full lg:w-5/12 border border-blue-200 rounded-md overflow-hidden">
                      <div className="flex border-b border-gray-200">
                        {["Jobs", "Spare", "Oils"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium ${
                              activeTab === tab
                                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="p-4 bg-white flex gap-2 border-b border-gray-100">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                          + New
                        </button>
                        <div className="flex-1 flex">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                          <button className="bg-teal-600 text-white px-4 rounded-r text-sm">
                            Search
                          </button>
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-[400px]">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-gray-100">
                            {filteredInventory.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-800">
                                  {item.name}
                                </td>
                                <td className="p-3 text-gray-500 text-right">
                                  {item.availQty}
                                </td>
                                <td className="p-3 text-gray-800 text-right">
                                  Rs. {item.price}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleSelectItem(item)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT: Selected Items */}
                    <div className="w-full lg:w-7/12">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">
                        Selected Items
                      </h3>
                      <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                              <tr>
                                <th className="p-3">Item Name</th>
                                <th className="p-3">Avail.</th>
                                <th className="p-3 w-20">Need Qty</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Total</th>
                                <th className="p-3 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selectedItems.map((item) => (
                                <tr key={item.id}>
                                  <td className="p-3">{item.name}</td>
                                  <td className="p-3 text-gray-500">
                                    {item.availQty}
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.needQty}
                                      onChange={(e) =>
                                        handleQtyChange(item.id, e.target.value)
                                      }
                                      className="w-16 border border-gray-300 rounded px-1 py-1 text-center"
                                    />
                                  </td>
                                  <td className="p-3">{item.price}</td>
                                  <td className="p-3 font-semibold">
                                    Rs. {item.total}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-red-500 hover:text-red-700 font-bold px-2"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {selectedItems.length === 0 && (
                                <tr>
                                  <td
                                    colSpan="6"
                                    className="p-8 text-center text-gray-400"
                                  >
                                    No items selected
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            {selectedItems.length > 0 && (
                              <tfoot className="bg-gray-50 font-bold text-gray-800">
                                <tr>
                                  <td colSpan="4" className="p-3 text-right">
                                    Grand Total:
                                  </td>
                                  <td className="p-3">
                                    Rs.{" "}
                                    {selectedItems.reduce(
                                      (acc, curr) => acc + curr.total,
                                      0
                                    )}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </div>

                      {/* Step 2 Buttons */}
                      <div className="flex justify-end mt-8 gap-4">
                        <button
                          onClick={handlePrevious}
                          className="px-6 py-2.5 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium"
                        >
                          Previous
                        </button>
                        {/* CHANGED: This is now a NEXT button, not create */}
                        <button
                          onClick={handleNext}
                          className="px-6 py-2.5 rounded-md text-white font-semibold shadow-sm bg-blue-600 hover:bg-blue-700"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 3: FINAL DETAILS (New Step) ================= */}
              {currentStep === 3 && (
                <div className="p-6">
                  <form>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Delivery Date */}
                      <FormField label="Delivery Date">
                        <input
                          type="date"
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </FormField>

                      {/* Delivery Time */}
                      <FormField label="Delivery Time">
                        <input
                          type="time"
                          name="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </FormField>

                      {/* Select Mechanic */}
                      <FormField label="Select Mechanic">
                        <select
                          name="mechanic"
                          value={formData.mechanic}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {mechanicsList.map((mech, index) => (
                            <option key={index} value={mech}>
                              {mech}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      {/* Advance Amount */}
                      <FormField label="Advance Amount">
                        <input
                          type="number"
                          name="advanceAmount"
                          value={formData.advanceAmount}
                          onChange={handleChange}
                          placeholder="Enter Amount"
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </FormField>

                      {/* 👇 NEW: Reminder 1 Input */}
                      <FormField label="Reminder 1">
                        <input
                          type="date"
                          name="reminder1"
                          value={formData.reminder1}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </FormField>

                      {/* 👇 NEW: Reminder 2 Input */}
                      <FormField label="Reminder 2">
                        <input
                          type="date"
                          name="reminder2"
                          value={formData.reminder2}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </FormField>

                      {/* 👇 NEW: Expected Completion */}
                      <FormField label="Expected Completion">
                        <input
                          type="datetime-local"
                          name="completionDateTime"
                          value={formData.completionDateTime}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </FormField>
                    </div>

                    {/* Step 3 Buttons (Final Submit) */}
                    <div className="flex justify-end mt-12 gap-4 pt-6 border-t border-gray-100">
                      <button
                        onClick={handlePrevious}
                        className="px-6 py-2.5 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium"
                      >
                        Previous
                      </button>
                      <button
                        type="button" // Prevent form default submit
                        onClick={handleSubmit}
                        className="px-6 py-2.5 rounded-md text-white font-semibold shadow-sm bg-green-600 hover:bg-green-700"
                      >
                        Create Jobcard
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
