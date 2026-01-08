




"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Spinner from "../../components/Spinner";
import EstimationModal from '../../components/EstimationModal.jsx';
import { useAlert } from "../../context/AlertContext";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- ICONS ---
const Icons = {
  Save: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  Next: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-2"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Prev: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  Eye: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Trash: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
};

// --- COMPONENTS ---
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  children,
  readOnly = false,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={readOnly}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 read-only:bg-gray-100"
      />
    )}
  </div>
);

const StepIndicator = ({ step, title }) => (
  <div className="bg-blue-600 px-6 py-4 rounded-t-lg flex justify-between items-center text-white shadow-md">
    <h2 className="text-lg font-semibold">{title}</h2>
    <span className="text-sm bg-blue-700 px-3 py-1 rounded-full font-medium">
      Step {step} of 3
    </span>
  </div>
);

export default function EditWashingJobPage() {
  const router = useRouter();
  const params = useParams();
  const { id: jobId } = params;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEstimationModalOpen, setEstimationModalOpen] = useState(false);
  const { showAlert } = useAlert();

  // --- MAIN STATE MAPPED TO DB COLUMNS ---
  const [formData, setFormData] = useState({
    // Step 1
    vehicle_no: "",
    make: "",
    model: "",
    customer_name: "",
    mobile_number: "",
    customer_voice: "",
    email: "",
    status: "Open",

    // Step 3 (Completion)
    delivery_date: "",
    delivery_time: "",
    user_id: "", // Mechanic/User
    advance_amount: 0,
    bill_amount: 0,
    labour_charge: 0,
    completion_date: "", // Separate fields for UI, combined for DB usually
    completion_time: "",
    exit_date: "",
    exit_time: "",
    remind_period: "1 Month",
  });

  // Lists
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [mechanicsList, setMechanicsList] = useState([
    "Shri Garage",
    "Mechanic A",
    "Mechanic B",
  ]); // Replace with API if needed

  // Step 2 Items
  const [activeTab, setActiveTab] = useState("Jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockItems, setStockItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // --- DATA FETCHING ---
  const fetchModels = useCallback(
    async (makeName) => {
      if (!makeName) return;
      try {
        // Find ID based on name for API call
        const makeObj = makes.find((m) => m.name === makeName);
        if (makeObj) {
          const res = await Axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/models/${makeObj.id}`
          );
          if (res.data.success) setModels(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [makes]
  );

  const fetchStockItems = useCallback(async (category) => {
    try {
      const typeMap = { Jobs: "job", Spare: "spare", Oil: "oil" };
      const res = await Axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=${typeMap[category]}`
      );
      setStockItems(res.data.success ? res.data.data : []);
    } catch (err) {
      setStockItems([]);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (!jobId) return;
    const initData = async () => {
      setLoading(true);
      try {
        const [makesRes, jobRes] = await Promise.all([
          Axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/makes`),
          Axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/washing-jobs/${jobId}`),
        ]);

        if (!jobRes.data.success) throw new Error("Job not found");

        const job = jobRes.data.data;
        const allMakes = makesRes.data.data || [];
        setMakes(allMakes);

        // Populate Form Data from DB
        setFormData({
          vehicle_no: job.vehicle_no || "",
          make: job.make || "",
          model: job.model || "",
          customer_name: job.customer_name || "",
          mobile_number: job.mobile_number || "",
          email: job.email || "",
          customer_voice: job.customer_voice || "",
          status: job.status || "Open",

          delivery_date: job.delivery_date
            ? job.delivery_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          delivery_time: job.delivery_time || "",
          user_id: job.user_id || "", // Mechanic
          advance_amount: job.advance_amount || 0,
          bill_amount: job.bill_amount || 0,
          labour_charge: job.labour_charge || 0,

          // Handle Split DateTime if stored combined, or separate columns
          completion_date: job.completion_datetime
            ? job.completion_datetime.split("T")[0]
            : "",
          completion_time: job.completion_datetime
            ? job.completion_datetime.split("T")[1]?.slice(0, 5)
            : "",

          exit_date: job.exit_datetime ? job.exit_datetime.split("T")[0] : "",
          exit_time: job.exit_datetime
            ? job.exit_datetime.split("T")[1]?.slice(0, 5)
            : "",

          remind_period: job.remind_period || "1 Month",
        });

        // Load models for the current make
        if (job.make) {
          const makeObj = allMakes.find((m) => m.name === job.make);
          if (makeObj) {
            const modelsRes = await Axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/models/${makeObj.id}`
            );
            if (modelsRes.data.success) setModels(modelsRes.data.data);
          }
        }

        // Load Items if they come with the job (Optional: depends on your backend response structure)
        if (job.items && Array.isArray(job.items)) {
          setSelectedItems(
            job.items.map((i) => ({
              id: i.item_id, // Ensure this matches DB
              name: i.item_name,
              availQty: 99, // Static or fetch
              needQty: i.quantity,
              unitPrice: i.price,
              type: i.type || "Jobs",
            }))
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [jobId]);

  // Fetch stock when tab changes
  useEffect(() => {
    if (currentStep === 2) fetchStockItems(activeTab);
  }, [currentStep, activeTab, fetchStockItems]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Dynamic Model Fetching
    if (name === "make") {
      setModels([]);
      fetchModels(value);
    }
  };

  const handleAddItem = (item) => {
    if (selectedItems.find((i) => i.id === item.id)) {
      showAlert("Item already added!", "warning");
      return;
    }
    setSelectedItems([
      ...selectedItems,
      {
        id: item.id,
        name: item.product_name || item.name,
        availQty: item.stock || 0,
        needQty: 1,
        unitPrice: parseFloat(item.unit_price || 0),
        type: activeTab,
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setSelectedItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: parseFloat(value) || 0 };
        }
        return item;
      })
    );
  };

  // --- TOTAL CALCULATION ---
  const totalItemCost = selectedItems.reduce(
    (acc, i) => acc + i.needQty * i.unitPrice,
    0
  );
  const finalBillAmount = totalItemCost; // Add tax logic here if needed
  const balanceAmount =
    finalBillAmount - (parseFloat(formData.advance_amount) || 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare Payload to match Database Columns
      const payload = {
        ...formData,
        bill_amount: finalBillAmount, // Auto-calculated

        // Combine Date/Time for DB DateTime columns
        completion_datetime: formData.completion_date
          ? `${formData.completion_date} ${
              formData.completion_time || "00:00"
            }:00`
          : null,
        exit_datetime: formData.exit_date
          ? `${formData.exit_date} ${formData.exit_time || "00:00"}:00`
          : null,

        items: selectedItems.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          quantity: i.needQty,
          price: i.unitPrice,
          total: i.needQty * i.unitPrice,
          type: i.type,
        })),
      };

      console.log("Sending Payload:", payload);

      const res = await Axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/washing-jobs/${jobId}`,
        payload
      );
      if (res.data.success) {
        showAlert("Job Saved Successfully!", "success");
        router.push("/JobWashingList/layout");
      }
    } catch (err) {
      console.error(err);
      showAlert(`Error: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner />
      </div>
    );
  if (error)
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  const filteredStock = stockItems.filter((i) =>
    (i.product_name || i.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* --- HEADER --- */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentStep === 1
                ? "Edit Washing Job"
                : currentStep === 2
                ? "Select Items"
                : "Finalize Job"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Job ID: #{jobId}</p>
          </div>
          {currentStep === 1 && (
            <button
              onClick={() => setEstimationModalOpen(true)}
              className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 font-medium"
            >
              <Icons.Eye /> Estimation
            </button>
          )}
        </div>

        {/* --- STEP 1: DETAILS --- */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <StepIndicator step={1} title="Details" />
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <FormField
                  label="Vehicle No"
                  name="vehicle_no"
                  value={formData.vehicle_no}
                  onChange={handleInputChange}
                  required
                />
                <FormField
                  label="Make"
                  name="make"
                  type="select"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Make</option>
                  {makes.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </FormField>
                <FormField
                  label="Model"
                  name="model"
                  type="select"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Model</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </FormField>
                <FormField
                  label="Customer Name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                />
                <FormField
                  label="Mobile Number"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  required
                />
                <FormField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Voice
                  </label>
                  <input
                    type="text"
                    name="customer_voice"
                    value={formData.customer_voice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end border-t pt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Next <Icons.Next />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: ITEMS --- */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[700px]">
            <StepIndicator step={2} title="Choose Items" />
            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
              {/* Stock List */}
              <div className="w-full lg:w-1/2 flex flex-col border-r">
                <div className="flex border-b">
                  {["Jobs", "Spare", "Oil"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSearchQuery("");
                      }}
                      className={`flex-1 py-3 text-sm font-medium transition ${
                        activeTab === tab
                          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-4 flex gap-2 border-b bg-gray-50">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-3 pr-8 py-2 border rounded text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b sticky top-0">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3">Price</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredStock.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50">
                          <td className="p-3 font-medium">
                            {item.product_name || item.name}
                          </td>
                          <td className="p-3 text-center">
                            {item.stock || "-"}
                          </td>
                          <td className="p-3">{item.unit_price}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleAddItem(item)}
                              className="bg-blue-600 text-white text-xs px-3 py-1 rounded"
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
              {/* Selected Items */}
              <div className="w-full lg:w-1/2 flex flex-col bg-white">
                <div className="p-3 bg-gray-100 border-b font-semibold text-gray-700">
                  Selected Items
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3 w-16 text-center">Qty</th>
                        <th className="p-3 w-20 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="1"
                              className="w-12 border text-center"
                              value={item.needQty}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "needQty",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              className="w-20 border text-right"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "unitPrice",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-3 text-right">
                            {(item.needQty * item.unitPrice).toFixed(0)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500"
                            >
                              <Icons.Trash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                  <div className="text-lg font-bold">
                    Total:{" "}
                    <span className="text-blue-600">Rs. {totalItemCost}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border rounded bg-white"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 bg-blue-600 text-white rounded"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: FINALIZE --- */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <StepIndicator step={3} title="Finalize Job" />
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <FormField
                  label="Delivery Date"
                  name="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  required
                />
                <FormField
                  label="Delivery Time"
                  name="delivery_time"
                  type="time"
                  value={formData.delivery_time}
                  onChange={handleInputChange}
                />
                <FormField label="Select Mechanic" name="user_id" type="select" value={formData.user_id} onChange={handleInputChange} required>
                                    <option value="">Select Mechanic</option>
                                    {mechanicsList.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </FormField>
                {/* <FormField
                  label="Select Mechanic"
                  name="user_id"
                  type="select"
                  value={formData.user_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Mechanic</option>
                  {mechanicsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </FormField> */}
                <FormField
                  label="Advance Amount"
                  name="advance_amount"
                  type="number"
                  value={formData.advance_amount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Bill Amount *
                  </label>
                  <input
                    type="text"
                    value={finalBillAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold"
                  />
                </div>
                <FormField
                  label="Completion Date"
                  name="completion_date"
                  type="date"
                  value={formData.completion_date}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Completion Time"
                  name="completion_time"
                  type="time"
                  value={formData.completion_time}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Exit Date"
                  name="exit_date"
                  type="date"
                  value={formData.exit_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <FormField
                  label="Exit Time"
                  name="exit_time"
                  type="time"
                  value={formData.exit_time}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Select Reminder"
                  name="remind_period"
                  type="select"
                  value={formData.remind_period}
                  onChange={handleInputChange}
                >
                  <option value="1 Month">1 Month</option>
                  <option value="3 Month">3 Month</option>
                  <option value="6 Month">6 Month</option>
                </FormField>
                <div>
                  <label className="block text-sm font-bold text-green-700 mb-1">
                    Balance
                  </label>
                  <input
                    type="text"
                    value={balanceAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-green-300 rounded-md bg-green-50 font-bold text-green-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 border rounded hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 font-bold disabled:opacity-50"
                >
                  <Icons.Save /> {saving ? "Saving..." : "Save Jobcard"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      {/* Modal */}
      {isEstimationModalOpen && (
        <EstimationModal
          isOpen={isEstimationModalOpen}
          onClose={() => setEstimationModalOpen(false)}
          jobDetails={{ ...formData, id: jobId }}
          estimationData={{
            services: selectedItems.map((item) => ({
              service: item.name,
              quantity: item.needQty,
              rate: item.unitPrice,
              amount: item.needQty * item.unitPrice,
            })),
            total_amount: finalBillAmount,
          }}
        />
      )}
    </div>
  );
}
