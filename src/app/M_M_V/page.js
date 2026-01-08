


"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * A reusable modal component for adding new items.
 */
function AddItemModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  itemName,
  setItemName,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    // Backdrop with z-50 to sit above everything
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
      {/* Modal Content - Responsive Width */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all relative">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <span className="text-2xl">&times;</span>
            </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="itemName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Item Name
            </label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter name..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  
  const [error, setError] = useState(null);

  const [modalView, setModalView] = useState(null); 
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // --- Data Fetching Functions ---
  const fetchMakes = useCallback(async () => {
    setIsLoadingMakes(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/makes`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setMakes(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch makes");
      }
    } catch (error) {
      console.error("Failed to fetch makes:", error);
      setError(error.message);
    } finally {
      setIsLoadingMakes(false);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    if (!selectedMake) return; 
    setIsLoadingModels(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/models/${selectedMake}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setModels(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch models");
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setError(error.message);
    } finally {
      setIsLoadingModels(false);
    }
  }, [selectedMake]); 

  const fetchVariants = useCallback(async () => {
    if (!selectedModel) return;
    setIsLoadingVariants(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/variants/${selectedModel}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setVariants(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch variants");
      }
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setError(error.message);
    } finally {
      setIsLoadingVariants(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  useEffect(() => {
    setSelectedModel("");
    setSelectedVariant("");
    setModels([]);
    setVariants([]);
    if (selectedMake) fetchModels();
  }, [selectedMake, fetchModels]);

  useEffect(() => {
    setSelectedVariant("");
    setVariants([]);
    if (selectedModel) fetchVariants();
  }, [selectedModel, fetchVariants]);

  // --- Handlers ---
  const handleMakeChange = (e) => setSelectedMake(e.target.value);
  const handleModelChange = (e) => setSelectedModel(e.target.value);
  const handleVariantChange = (e) => setSelectedVariant(e.target.value);

  const openModal = (type) => {
    setModalView(type);
    setNewItemName("");
    setModalError(null);
  };

  const closeModal = () => {
    setModalView(null);
    setNewItemName("");
    setIsSubmitting(false);
    setModalError(null);
  };

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    setModalError(null);
    let url = "";
    let body = {};

    if (modalView === "make") {
      url = `${API_BASE_URL}/api/makes`;
      body = { name: newItemName };
    } else if (modalView === "model") {
      url = `${API_BASE_URL}/api/models`;
      body = { name: newItemName, make_id: selectedMake };
    } else if (modalView === "variant") {
      url = `${API_BASE_URL}/api/variants`;
      body = { name: newItemName, model_id: selectedModel };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save item");
      }
      closeModal();
      if (modalView === "make") await fetchMakes();
      if (modalView === "model") await fetchModels();
      if (modalView === "variant") await fetchVariants();
    } catch (err) {
      console.error("Failed to submit new item:", err);
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    if (modalView === "make") return "Add New Make";
    if (modalView === "model") {
        const make = makes.find(m => String(m.id) === String(selectedMake));
        return `Add New Model for ${make?.name || "Selected Make"}`;
    }
    if (modalView === "variant") {
        const model = models.find(m => String(m.id) === String(selectedModel));
        return `Add New Variant for ${model?.name || "Selected Model"}`;
    }
    return "";
  };

  return (
    // 1. FLEX WRAPPER: Ensures Footer pushes to bottom
    <div className="flex flex-col min-h-screen w-full bg-slate-50">
      <Header />
      
      {/* 2. CONTENT WRAPPER: Flex-grow takes available space */}
      <main className="flex-grow w-full font-sans">
        <div className="container mx-auto px-4 py-6 md:px-8 md:py-10 max-w-7xl">
          
          {/* Header Section: Stacks on mobile, Row on desktop */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Vehicle Management
            </h1>
            <nav className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 inline-flex items-center self-start sm:self-auto">
              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors">
                Home
              </span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-gray-700">Make Model Variant</span>
            </nav>
          </header>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 md:p-6 flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
              </div>
              <h2 className="text-xl font-bold tracking-wide">Configuration Panel</h2>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 m-6 md:mx-8 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md shadow-sm">
                <p className="font-medium">Error occurred:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* 3. RESPONSIVE GRID: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
                
                {/* Select Make Group */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">Vehicle Make</label>
                    <div className="flex shadow-sm rounded-md h-11">
                      <div className="relative flex-grow">
                        <select
                          value={selectedMake}
                          onChange={handleMakeChange}
                          disabled={isLoadingMakes}
                          className="block w-full h-full rounded-l-md border-gray-300 border-r-0 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        >
                          <option value="">
                            {isLoadingMakes ? "Loading..." : "Select Make"}
                          </option>
                          {makes.map((make) => (
                            <option key={make.id} value={make.id}>
                              {make.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => openModal("make")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 text-sm font-medium rounded-r-md border border-blue-600 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center min-w-[3.5rem]"
                        title="Add New Make"
                      >
                        <span className="text-xl leading-none font-bold">+</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">Select or add a vehicle manufacturer.</p>
                </div>

                {/* Select Model Group */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">Vehicle Model</label>
                    <div className="flex shadow-sm rounded-md h-11">
                      <div className="relative flex-grow">
                        <select
                          value={selectedModel}
                          onChange={handleModelChange}
                          disabled={!selectedMake || isLoadingModels}
                          className="block w-full h-full rounded-l-md border-gray-300 border-r-0 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        >
                          <option value="">
                            {isLoadingModels ? "Loading..." : "Select Model"}
                          </option>
                          {models.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => openModal("model")}
                        disabled={!selectedMake}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 text-sm font-medium rounded-r-md border border-blue-600 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[3.5rem]"
                        title="Add New Model"
                      >
                        <span className="text-xl leading-none font-bold">+</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">Select a make first to see models.</p>
                </div>

                {/* Select Variant Group */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">Vehicle Variant</label>
                    <div className="flex shadow-sm rounded-md h-11">
                      <div className="relative flex-grow">
                        <select
                          value={selectedVariant}
                          onChange={handleVariantChange}
                          disabled={!selectedModel || isLoadingVariants}
                          className="block w-full h-full rounded-l-md border-gray-300 border-r-0 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        >
                          <option value="">
                            {isLoadingVariants ? "Loading..." : "Select Variant"}
                          </option>
                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => openModal("variant")}
                        disabled={!selectedModel}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 text-sm font-medium rounded-r-md border border-blue-600 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[3.5rem]"
                        title="Add New Variant"
                      >
                        <span className="text-xl leading-none font-bold">+</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">Select a model first to see variants.</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Adding New Items */}
      <AddItemModal
        isOpen={!!modalView}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        title={getModalTitle()}
        itemName={newItemName}
        setItemName={setNewItemName}
        isLoading={isSubmitting}
      />
      
      {/* Display Modal-specific errors */}
      {modalError && (
         <div className="fixed bottom-6 right-6 bg-white border-l-4 border-red-500 text-gray-800 p-4 rounded shadow-2xl z-50 flex items-start max-w-sm animate-fade-in-up">
           <div className="mr-3 text-red-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div className="flex-1">
             <h4 className="font-bold text-sm mb-1">Action Failed</h4>
             <p className="text-sm">{modalError}</p>
           </div>
           <button onClick={() => setModalError(null)} className="ml-4 text-gray-400 hover:text-gray-600">
             <span className="text-xl font-bold">&times;</span>
           </button>
         </div>
       )}
       
       <Footer />
    </div>
  );
}