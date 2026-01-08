



'use client';
import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';
import AddCustomerModal from '../AddNewCustomer/AddCustomerModal';
import axios from 'axios';

// --- Icon Components ---
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

const ListIcon = () => (
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
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const RemoveIcon = () => (
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
    className="h-4 w-4"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Helper Components ---
const FormField = ({ label, required, children, className = '', labelExtras = null }) => (
  <div className={className}>
    <div className="flex justify-between items-center mb-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {labelExtras}
    </div>
    {children}
  </div>
);

const StyledInput = (props) => (
  <input
    {...props}
    className={`block w-full border-0 border-b-2 border-gray-400 bg-transparent px-1 py-2 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-0 ${
      props.className || ''
    }`}
  />
);

const StyledSelect = (props) => (
  <select
    {...props}
    className="block w-full border-0 border-b-2 border-gray-400 bg-transparent px-1 py-2 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-0"
  >
    {props.children}
  </select>
);

// --- MAIN COMPONENT (Fully Dynamic) ---

export default function CreateQuotationPage() {
  // --- Main Form State ---
  const [customerId, setCustomerId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- State for stock items ---
  const [stockItems, setStockItems] = useState([]);

  // --- Item List State ---
  const [items, setItems] = useState([
    {
      stockId: '', 
      itemName: '',
      hsn: '',
      quantity: 1,
      rate: 0,
      gst: 0,
      amount: 0,
    },
  ]);

  // --- API/Loading State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Fetch Customers and Stock on Page Load ---
  const fetchData = async () => {
    try {
      // Fetch stock items
      const stockRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stock`);
      if (stockRes.data.success) {
        setStockItems(stockRes.data.data);
      }

      // Fetch customers
      const customerRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`);
      if (customerRes.data.success) {
        setCustomers(customerRes.data.data);
      }

    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to load customers or stock. Please refresh.');
    }
  };
    
  // Call fetchData on mount
  useEffect(() => {
    fetchData();
  }, []);

  // --- Item Management Functions ---
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...items];
    list[index][name] = value;

    // Auto-fill logic
    if (name === 'stockId') {
      const selectedItem = stockItems.find(
        (item) => item.id === parseInt(value)
      );

      if (selectedItem) {
        list[index].itemName = selectedItem.product_name;
        list[index].hsn = selectedItem.hsn_code || '';
        list[index].rate = selectedItem.unit_price || 0;
      }
    }

    // Real-time Calculation
    const qty = parseFloat(list[index].quantity) || 0;
    const rate = parseFloat(list[index].rate) || 0;
    const gst = parseFloat(list[index].gst) || 0;
    const itemAmount = (qty * rate) * (1 + gst / 100);
    list[index].amount = itemAmount.toFixed(2);

    setItems(list);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        stockId: '',
        itemName: '',
        hsn: '',
        quantity: 1,
        rate: 0,
        gst: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const list = [...items];
    list.splice(index, 1);
    setItems(list);
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!customerId || !vehicleNumber || items.length === 0) {
      setError('Customer, Vehicle Number, and at least one item are required.');
      setLoading(false);
      return;
    }

    const quotationData = {
      customerId, 
      vehicleNumber,
      quotationDate,
      items,
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/quotations`, quotationData);

      if (response.data.success) {
        setSuccess('Quotation created successfully!');
        setCustomerId('');
        setVehicleNumber('');
        setItems([
          {
            stockId: '',
            itemName: '',
            hsn: '',
            quantity: 1,
            rate: 0,
            gst: 0,
            amount: 0,
          },
        ]);
      } else {
        throw new Error(response.data.message || 'Failed to create quotation.');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const serverDetails = err.response?.data?.details;
      setError(serverMessage || serverDetails || err.message || 'An unknown error occurred.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header & Sub-header */}
          <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800">Quotation</h1>
            <nav aria-label="breadcrumb" className="text-sm text-gray-500">
              <ol className="list-none p-0 inline-flex flex-wrap">
                <li className="flex items-center">
                  <Link href="/" className="text-blue-600 hover:underline">
                    Home
                  </Link>
                  <ChevronRightIcon />
                </li>
                <li className="flex items-center">
                  <Link href="/quotations" className="text-blue-600 hover:underline">
                    Quotation
                  </Link>
                  <ChevronRightIcon />
                </li>
                <li className="text-gray-400" aria-current="page">
                  Create Quotation
                </li>
              </ol>
            </nav>
          </header>
          <div className="mb-6 flex items-center justify-between rounded-t-lg bg-blue-600 p-4">
            <h2 className="flex items-center text-lg font-semibold text-white">
              <ListIcon />
              Create Quotation
            </h2>
          </div>

          {/* --- Main Content Form --- */}
          <div className="rounded-b-lg bg-white p-6 shadow">
            <form onSubmit={handleSubmit}>
              {/* Customer, Vehicle, Date */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                
                {/* --- Customer Field (now a dropdown) --- */}
                <FormField
                  label="Customer"
                  required
                  labelExtras={
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm text-blue-600 whitespace-nowrap hover:underline"
                    >
                      + New Customer
                    </button>
                  }
                >
                  <StyledSelect
                    id="customer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customer_name || customer.full_name} ({customer.mobile_number})
                      </option>
                    ))}
                  </StyledSelect>
                </FormField>
                
                {/* --- Vehicle Number --- */}
                <FormField label="Vehicle Number" required>
                  <StyledInput
                    type="text"
                    id="vehicleNumber"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                  />
                </FormField>
                
                {/* --- Quotation Date --- */}
                <FormField label="Quotation Date">
                  <StyledInput
                    type="date"
                    id="quotationDate"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                  />
                </FormField>
              </div>

              {/* --- Item List --- */}
              <div className="mt-10">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Item List
                </h3>
                <div className="mt-4 flex flex-col space-y-4">
                  {/* Item Header */}
                  <div className="flex w-full items-start space-x-4">
                    <div className="w-3/12">
                      <label className="block text-sm font-medium text-gray-700">Item</label>
                    </div>
                    <div className="w-2/12">
                      <label className="block text-sm font-medium text-gray-700">HSN</label>
                    </div>
                    <div className="w-1/12">
                      <label className="block text-sm font-medium text-gray-700">Qty</label>
                    </div>
                    <div className="w-2/12">
                      <label className="block text-sm font-medium text-gray-700">Rate</label>
                    </div>
                    <div className="w-1/12">
                      <label className="block text-sm font-medium text-gray-700">GST %</label>
                    </div>
                    <div className="w-2/12">
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                    </div>
                    <div className="w-1/12"></div> {/* For Remove btn */}
                  </div>

                  {/* --- DYNAMIC Item Rows --- */}
                  {items.map((item, index) => (
                    <div key={index} className="flex w-full items-start space-x-4">
                      {/* Item Name (select) */}
                      <div className="w-3/12">
                        <StyledSelect
                          name="stockId"
                          value={item.stockId}
                          onChange={(e) => handleItemChange(index, e)}
                        >
                          <option value="">Select Item</option>
                          {stockItems.map((stockItem) => (
                            <option key={stockItem.id} value={stockItem.id}>
                              {stockItem.product_name}
                            </option>
                          ))}
                        </StyledSelect>
                      </div>

                      {/* HSN (auto-filled) */}
                      <div className="w-2/12">
                        <StyledInput
                          type="text"
                          name="hsn"
                          placeholder="HSN"
                          value={item.hsn}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="w-1/12">
                        <StyledInput
                          type="number"
                          name="quantity"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </div>

                      {/* Rate (auto-filled) */}
                      <div className="w-2/12">
                        <StyledInput
                          type="number"
                          name="rate"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </div>

                      {/* GST */}
                      <div className="w-1/12">
                        <StyledInput
                          type="number"
                          name="gst"
                          placeholder="GST"
                          value={item.gst}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                      </div>

                      {/* Amount (read-only) */}
                      <div className="w-2/12">
                        <StyledInput
                          type="text"
                          name="amount"
                          placeholder="Amount"
                          value={item.amount}
                          readOnly
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>
                      <div className="w-1/12 flex pt-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <RemoveIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-blue-600 text-2xl font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  +
                </button>
              </div>

              {/* Submission Area & Messages */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {error && (
                <div className="mt-4 text-sm text-red-600">{error}</div>
              )}
              {success && (
                <div className="mt-4 text-sm text-green-600">{success}</div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
      {/* --- RE-ADDED MODAL --- */}
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchData(); // Re-fetch all data (including customers)
        }}
      />
    </div>
  );
}