"use client";

import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Link from "next/link";
import axios from "axios";
import EstimationModal from "../components/EstimationModal"; // Import the modal
import { useAlert } from "../context/AlertContext"; // Import useAlert for notifications

// --- SVG Icons (as reusable components) ---
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v12m8-8H4"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
  </svg>
);
const ShowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// --- Main Page Component ---
export default function QuotationPage() {
  const [quotationData, setQuotationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 10;

  // State for the estimation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loadingQuotationId, setLoadingQuotationId] = useState(null);
  const { showAlert, showConfirm } = useAlert(); // Use both from AlertContext

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- Fetch Quotations from API ---
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/quotations`,
          {
            params: {
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              search: searchQuery,
            },
          }
        );
        if (response.data.success) {
          const quotations = response.data.data.map((q, index) => ({
            id: q.id,
            customerName: q.customer_name,
            created: new Date(q.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            vehicleNumber: q.vehicle_number,
            items: q.item_count || 0,
            quotationDate: q.quotation_date,
            totalAmount: parseFloat(q.total_amount) || 0,
          }));
          setQuotationData(quotations);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalRecords(response.data.pagination.totalRecords);
            setCurrentPage(response.data.pagination.currentPage);
          }
        }
      } catch (err) {
        console.error("Failed to fetch quotations:", err);
        setError("Failed to load quotations");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, [currentPage, searchQuery]);

  // --- Handle Show Button Click ---
  const handleShowClick = async (quotationId) => {
    setLoadingQuotationId(quotationId);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/quotations/${quotationId}`
      );
      if (response.data.success) {
        const apiData = response.data.data;

        // The modal expects a 'services' array, but the API provides 'items'. Let's transform it.
        const transformedData = {
          ...apiData,
          services: apiData.items.map((item) => ({
            service: item.item_name, // Keep existing
            amount: item.amount, // Keep existing
            quantity: item.quantity, // Add quantity
            rate: item.rate, // Add rate
          })),
        };

        setSelectedQuotation(transformedData);
        setIsModalOpen(true);
      } else {
        showAlert(
          response.data.message || "Could not fetch estimation details.",
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to fetch quotation details:", err);
      showAlert(
        err.response?.data?.message ||
          "An error occurred while fetching details.",
        "error"
      );
    } finally {
      setLoadingQuotationId(null);
    }
  };

  // --- Handle Delete ---
  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this quotation?"
    );
    if (confirmed) {
      try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/quotations/${id}`);
        if (response.data.success) {
          showAlert("Quotation deleted successfully.", "success");
          setQuotationData((prev) => prev.filter((item) => item.id !== id));
        } else {
          showAlert(response.data.message || "Failed to delete quotation.", "error" );
        }
      } catch (err) {
        console.error("Delete error:", err);
        showAlert("An error occurred while deleting.", "error");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      {selectedQuotation && (
        <EstimationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          estimationData={selectedQuotation}
          jobDetails={selectedQuotation}
        />
      )}
      <div className="max-w-7xl mx-auto  p-4 w-full sm:p-6 lg:p-4">
        {/* --- Page Header --- */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
              Quotation
            </h1>
            <nav aria-label="breadcrumb" className="text-sm text-gray-500">
              <ol className="list-none p-0 inline-flex flex-wrap">
                <li className="flex items-center">
                  <a href="#" className="text-blue-600 hover:underline">
                    Home
                  </a>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-400" aria-current="page">
                  Quotation
                </li>
              </ol>
            </nav>
          </div>
        </header>

        {/* --- Main Content Card --- */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Action Bar */}
          <div className="bg-blue-600 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-white font-semibold text-lg">Quotation</h2>

            {/* Search Bar */}
            {/* <div className="relative w-full sm:w-64">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-md border-none focus:ring-2 focus:ring-blue-300 text-gray-800 outline-none"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <SearchIcon />
                            </div>
                        </div> */}

            <Link
              href="/NewQuotation/layout"
              className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 transition-colors flex items-center justify-center w-full sm:w-auto"
            >
              <PlusIcon />
              Create Quotation
            </Link>
          </div>
          <div className="relative min-w-full border-b p-4 border-gray-300  divide-y sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border focus:ring-1 text-gray-800 outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-3 text-gray-400">
              <SearchIcon />
            </div>
          </div>
          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading quotations...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Responsive Table and Cards Container */}
          {!loading && !error && (
            <div className="p-4 overflow-x-auto">
              {/* --- Desktop Table View (hidden on small screens) --- */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        Sr. No.
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        Customer Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        Vehicle Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        No. of Items
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        Total Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotationData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No quotations found
                        </td>
                      </tr>
                    ) : (
                      quotationData.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div>{item.customerName}</div>
                            <div className="text-xs text-gray-400">
                              Created {item.created}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.vehicleNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.quotationDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.items}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            ₹{item.totalAmount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleShowClick(item.id)}
                                disabled={loadingQuotationId === item.id}
                                className="flex items-center justify-center bg-yellow-500 text-white px-3 py-1 rounded-md text-xs hover:bg-yellow-600 disabled:bg-yellow-300"
                              >
                                {loadingQuotationId === item.id ? (
                                  "..."
                                ) : (
                                  <>
                                    <EditIcon /> Show
                                  </>
                                )}
                              </button>
                              {/* <button className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600">
                                                            <ShowIcon /> Edit
                                                        </button> */}

                              <Link
                                href={`/Quatation/edit/${item.id}`}
                                className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600"
                              >
                                <ShowIcon /> Edit
                              </Link>

                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
                              >
                                <DeleteIcon /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- Mobile Card View (hidden on large screens) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {quotationData.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">
                    No quotations found
                  </p>
                ) : (
                  quotationData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-800">
                          #{item.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.vehicleNumber}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">
                          {item.customerName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created {item.created}
                        </p>
                        <p className="text-xs text-gray-400">
                          Date: {item.quotationDate}
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Items: </span>
                        <span className="font-semibold">{item.items}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Total: </span>
                        <span className="font-semibold">
                          ₹{item.totalAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="border-t pt-3 mt-2 flex items-center justify-start space-x-2 flex-wrap gap-2">
                        <button
                          onClick={() => handleShowClick(item.id)}
                          disabled={loadingQuotationId === item.id}
                          className="flex items-center justify-center bg-yellow-500 text-white px-3 py-1 rounded-md text-xs hover:bg-yellow-600 disabled:bg-yellow-300"
                        >
                          {loadingQuotationId === item.id ? (
                            "..."
                          ) : (
                            <>
                              <EditIcon /> Show
                            </>
                          )}
                        </button>
                        <button className="flex items-center justify-center bg-teal-500 text-white px-3 py-1 rounded-md text-xs hover:bg-teal-600">
                          <ShowIcon /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
                        >
                          <DeleteIcon /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && quotationData.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-4 py-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
                <span className="ml-1 text-gray-400">
                  ({totalRecords} total records)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    p = currentPage - 2 + i;
                    if (p > totalPages) p = totalPages - (4 - i);
                  }
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-md border ${
                        currentPage === p
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
