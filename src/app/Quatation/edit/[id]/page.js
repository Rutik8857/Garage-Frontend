




'use client';
import React, { useState, useEffect } from 'react';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import Link from 'next/link';
import AddCustomerModal from '../../../AddNewCustomer/AddCustomerModal';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { useAlert } from '../../../context/AlertContext';

// --- Icon Components ---
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400"><path d="m9 18 6-6-6-6" /></svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

const RemoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- Helper Components ---
const FormField = ({ label, required, children, className = '', labelExtras = null }) => (
  <div className={className}>
    <div className="flex justify-between items-center mb-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {labelExtras}
    </div>
    {children}
  </div>
);

const StyledInput = (props) => (
  <input {...props} className={`block w-full border-0 border-b-2 border-gray-400 bg-transparent px-1 py-2 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-0 ${props.className || ''}`} />
);

const StyledSelect = (props) => (
  <select {...props} className="block w-full border-0 border-b-2 border-gray-400 bg-transparent px-1 py-2 text-sm text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-0">{props.children}</select>
);

export default function QuotationForm() {
  const router = useRouter();
  const params = useParams();
  const editId = params.id;
  const { showAlert } = useAlert();

  // --- Main Form State ---
  const [customerId, setCustomerId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- State for stock items ---
  const [stockItems, setStockItems] = useState([]);

  // --- Item List State ---
  const [items, setItems] = useState([{ stockId: '', itemName: '', hsn: '', quantity: 1, rate: 0, gst: 0, amount: 0 }]);

  // --- API/Loading State ---
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const [error, setError] = useState(null);

  // --- 1. Fetch Dropdown Data & Edit Data ---
  useEffect(() => {
    const init = async () => {
      try {
        const [stockRes, customerRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stock`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`)
        ]);

        if (stockRes.data.success) setStockItems(stockRes.data.data);
        if (customerRes.data.success) setCustomers(customerRes.data.data);

        // If in Edit Mode, fetch existing quotation
        if (editId) {
          const quoteRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/quotations/${editId}`);
          if (quoteRes.data.success) {
            const data = quoteRes.data.data;
            setCustomerId(data.customer_id || '');
            setVehicleNumber(data.vehicle_number || '');
            // Safely handle date
            const dateStr = data.quotation_date ? new Date(data.quotation_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            setQuotationDate(dateStr);
            
            if (data.items && Array.isArray(data.items)) {
              const mappedItems = data.items.map(item => ({
                stockId: item.item_id || '', 
                itemName: item.item_name || '',
                hsn: item.hsn || item.hsn_code || '',
                quantity: item.quantity || 1,
                rate: item.rate || 0,
                gst: item.gst_percent || item.gst_rate || 0,
                amount: item.amount || 0
              }));
              setItems(mappedItems);
            }
          }
        }
      } catch (err) {
        console.error('Failed to init', err);
        if (err.response && err.response.status === 404) {
          setError('Quotation not found. It may have been deleted.');
        } else {
          setError('Failed to load data.');
        }
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [editId]);

  // --- NEW: Handle Customer Selection & Auto-fill ---
  const handleCustomerChange = (e) => {
    const selectedId = e.target.value;
    setCustomerId(selectedId);

    // Find the full customer object from the list
    const selectedCustomer = customers.find(c => c.id === parseInt(selectedId));

    if (selectedCustomer) {
      // Auto-fill Vehicle Number if it exists in the customer object
      // Note: Ensure your backend API /api/customers returns 'vehicle_number'
      if (selectedCustomer.vehicle_number) {
        setVehicleNumber(selectedCustomer.vehicle_number);
      } else if (selectedCustomer.vehicleNumber) {
        // Handle camelCase if backend returns that
        setVehicleNumber(selectedCustomer.vehicleNumber);
      } else {
        // Optional: Clear field if customer has no vehicle saved
        setVehicleNumber(''); 
      }
    } else {
      setVehicleNumber('');
    }
  };

  // --- Item Management ---
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...items];
    list[index][name] = value;

    if (name === 'stockId') {
      const selectedItem = stockItems.find((item) => item.id === parseInt(value));
      if (selectedItem) {
        list[index].itemName = selectedItem.product_name;
        list[index].hsn = selectedItem.hsn_code || '';
        list[index].rate = selectedItem.unit_price || 0;
      }
    }

    const qty = parseFloat(list[index].quantity) || 0;
    const rate = parseFloat(list[index].rate) || 0;
    const gst = parseFloat(list[index].gst) || 0;
    const itemAmount = (qty * rate) * (1 + gst / 100);
    list[index].amount = itemAmount.toFixed(2);

    setItems(list);
  };

  const handleAddItem = () => {
    setItems([...items, { stockId: '', itemName: '', hsn: '', quantity: 1, rate: 0, gst: 0, amount: 0 }]);
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

    if (!customerId || !vehicleNumber || items.length === 0) {
      setError('Customer, Vehicle Number, and at least one item are required.');
      setLoading(false);
      return;
    }

    const payload = { customerId, vehicleNumber, quotationDate, items };

    try {
      let response;
      if (editId) {
        response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/quotations/${editId}`, payload);
      } else {
        response = await axios.post('${process.env.NEXT_PUBLIC_API_URL}/api/quotations', payload);
      }

      if (response.data.success) {
        showAlert(editId ? 'Quotation updated successfully!' : 'Quotation created successfully!', 'success');
        if (!editId) {
          setCustomerId('');
          setVehicleNumber('');
          setItems([{ stockId: '', itemName: '', hsn: '', quantity: 1, rate: 0, gst: 0, amount: 0 }]);
        } else {
          setTimeout(() => router.push('/Quatation/layout'), 1500);
        }
      } else {
        throw new Error(response.data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error("Submission error:", err);
      if (err.response && err.response.status === 404) {
        setError(`Error: The backend API endpoint was not found (404). Please check if the 'PUT /api/quotations/${editId}' route exists.`);
      } else {
        setError(err.response?.data?.message || err.message || 'An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading form data...</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-800">{editId ? 'Edit Quotation' : 'Create Quotation'}</h1>
            <nav className="text-sm text-gray-500">
              <ol className="list-none p-0 inline-flex flex-wrap">
                <li className="flex items-center"><Link href="/" className="text-blue-600 hover:underline">Home</Link><ChevronRightIcon /></li>
                <li className="flex items-center"><Link href="/QuotationList/layout" className="text-blue-600 hover:underline">Quotation</Link><ChevronRightIcon /></li>
                <li className="text-gray-400">{editId ? 'Edit' : 'Create'}</li>
              </ol>
            </nav>
          </header>
          
          <div className="mb-6 flex items-center justify-between rounded-t-lg bg-blue-600 p-4">
            <h2 className="flex items-center text-lg font-semibold text-white"><ListIcon /> {editId ? 'Edit Quotation' : 'Create Quotation'}</h2>
          </div>

          {/* Form */}
          <div className="rounded-b-lg bg-white p-6 shadow">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                {/* Customer with Auto-Fill Logic */}
                <FormField label="Customer" required labelExtras={<button type="button" onClick={() => setIsModalOpen(true)} className="text-sm text-blue-600 hover:underline">+ New Customer</button>}>
                  <StyledSelect 
                    id="customer" 
                    value={customerId} 
                    onChange={handleCustomerChange} // <--- Updated Handler
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.customer_name} ({c.mobile_number})</option>
                    ))}
                  </StyledSelect>
                </FormField>
                
                {/* Vehicle - Auto-fills based on customer */}
                <FormField label="Vehicle Number" required>
                  <StyledInput type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required />
                </FormField>
                
                {/* Date */}
                <FormField label="Quotation Date">
                  <StyledInput type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} />
                </FormField>
              </div>

              {/* Items */}
              <div className="mt-10">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Item List</h3>
                <div className="mt-4 flex flex-col space-y-4">
                  {/* Header Row */}
                  <div className="flex w-full items-start space-x-4 text-sm font-medium text-gray-700">
                    <div className="w-3/12">Item</div><div className="w-2/12">HSN</div><div className="w-1/12">Qty</div>
                    <div className="w-2/12">Rate</div><div className="w-1/12">GST %</div><div className="w-2/12">Amount</div><div className="w-1/12"></div>
                  </div>
                  
                  {/* Rows */}
                  {items.map((item, index) => (
                    <div key={index} className="flex w-full items-start space-x-4">
                      <div className="w-3/12">
                        <StyledSelect name="stockId" value={item.stockId} onChange={(e) => handleItemChange(index, e)}>
                          <option value="">Select Item</option>
                          {stockItems.map((s) => <option key={s.id} value={s.id}>{s.product_name}</option>)}
                        </StyledSelect>
                      </div>
                      <div className="w-2/12"><StyledInput name="hsn" placeholder="HSN" value={item.hsn} onChange={(e) => handleItemChange(index, e)} /></div>
                      <div className="w-1/12"><StyledInput type="number" name="quantity" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, e)} /></div>
                      <div className="w-2/12"><StyledInput type="number" name="rate" placeholder="Rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} /></div>
                      <div className="w-1/12"><StyledInput type="number" name="gst" placeholder="GST" value={item.gst} onChange={(e) => handleItemChange(index, e)} /></div>
                      <div className="w-2/12"><StyledInput name="amount" placeholder="Amount" value={item.amount} readOnly className="bg-gray-100" /></div>
                      <div className="w-1/12 flex pt-2"><button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700"><RemoveIcon /></button></div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddItem} className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-2xl font-bold text-white hover:bg-blue-700">+</button>
              </div>

              {/* Submit */}
              <div className="mt-8">
                <button type="submit" disabled={loading} className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Saving...' : (editId ? 'Update Quotation' : 'Create Quotation')}
                </button>
              </div>
              {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <AddCustomerModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); /* trigger re-fetch of customers */ }} />
    </div>
  );
}