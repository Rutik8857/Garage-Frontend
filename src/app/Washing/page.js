



"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useAlert } from '../context/AlertContext';
import { useFormValidation, FieldError } from '../hooks/useFormValidation';
import Axios from 'axios';

// --- ICONS ---
const SelectArrowIcon = () => ( 
  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" > 
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 7.03 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l2.97-2.91a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" /> 
  </svg> 
);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

// Reusable Input Component
const FormField = ({ label, name, value, onChange, type = 'text', required = false, children, readOnly=false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'select' ? (
            <div className="relative">
                <select id={name} name={name} value={value} onChange={onChange} disabled={readOnly} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 appearance-none">
                    {children}
                </select>
                <SelectArrowIcon />
            </div>
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 read-only:bg-gray-100" />
        )}
    </div>
);



export default function NewWashingJobForm() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Validation Rules (Step 1)
  const { errors, validate } = useFormValidation({
    vehicleNo: { required: true, message: 'Vehicle No is required' },
    make: { required: true, message: 'Make is required' },
    customerName: { required: true, message: 'Customer Name is required' },
    mobileNumber: { required: true, message: 'Mobile Number is required' },
  });

  // --- STATE: Step 1 (Vehicle) ---
  const [formData, setFormData] = useState({
    vehicleNo: '', make: '', model: '', customerName: '', mobileNumber: '',
  });

  // --- STATE: Step 2 (Items) ---
  const [activeTab, setActiveTab] = useState('Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockItems, setStockItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // --- STATE: Step 3 (Completion) ---
  const [completionData, setCompletionData] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    mechanic: '',
    advanceAmount: 0,
    completionDate: new Date().toISOString().split('T')[0],
    completionTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    exitDate: new Date().toISOString().split('T')[0],
    exitTime: '00:00',
    reminderMonth: '2 Month'
  });

  // --- DYNAMIC DATA ---
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const mechanicsList = ['Shri Garage', 'Mechanic A', 'Mechanic B']; // Replace with API if needed

  // Load Makes
  useEffect(() => {
    const fetchMakes = async () => {
        try {
            const res = await Axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/makes`);
            if(res.data.success) setMakes(res.data.data);
        } catch (error) { console.error("Error fetching makes", error); }
    };
    fetchMakes();
  }, []);

  // Fetch Models
  const handleMakeChange = async (e) => {
      const { value } = e.target;
      setFormData(prev => ({ ...prev, make: value, model: '' }));
      if(value) {
          try {
              const selectedMakeObj = makes.find(m => m.name === value);
              if(selectedMakeObj) {
                  const res = await Axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/models/${selectedMakeObj.id}`);
                  if(res.data.success) setModels(res.data.data);
              }
          } catch (error) { console.error("Error fetching models", error); }
      } else { setModels([]); }
  };

  // Fetch Stock Items
  const fetchStockItems = useCallback(async (category) => {
    try {
        const typeMap = { 'Jobs': 'job', 'Spare': 'spare', 'Oil': 'oil' };
        const res = await Axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=${typeMap[category]}`);
        setStockItems(res.data.success ? res.data.data : []);
    } catch (err) { setStockItems([]); }
  }, []);

  useEffect(() => {
    if (currentStep === 2) fetchStockItems(activeTab);
  }, [currentStep, activeTab, fetchStockItems]);


  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompletionChange = (e) => {
    const { name, value } = e.target;
    setCompletionData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
      e.preventDefault();
      if (currentStep === 1) {
        const isValid = validate(formData);
        if (!isValid) {
        showAlert('Please fill all required fields', 'error');
        return;
      }
      }
      setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  const handleAddItem = (item) => {
    if (selectedItems.find(i => i.id === item.id)) { showAlert("Item already added!", "info"); return; }
    const newItem = {
        id: item.id,
        name: item.product_name || item.name,
        availQty: item.stock || 0,
        needQty: 1,
        unitPrice: parseFloat(item.unit_price || 0),
        type: activeTab
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItem = (id) => setSelectedItems(selectedItems.filter(i => i.id !== id));

  const handleItemChange = (id, field, value) => {
    setSelectedItems(items => items.map(item => {
        if (item.id === id) return { ...item, [field]: parseFloat(value) || 0 };
        return item;
    }));
  };

  // --- FINAL SUBMIT ---
  // const handleSubmit = async () => {
  //   if (!completionData.mechanic) {
  //     showAlert('Please select a mechanic', 'error');
  //     return;
  //   }

  //   setSaving(true);
  //   try {
  //     const totalAmount = selectedItems.reduce((acc, i) => acc + (i.needQty * i.unitPrice), 0);
  //     const advance = parseFloat(completionData.advanceAmount) || 0;

  //     const payload = {
  //         // Step 1 Data
  //         vehicle_no: formData.vehicleNo,
  //         make: formData.make,
  //         model: formData.model,
  //         customer_name: formData.customerName,
  //         mobile_number: formData.mobileNumber,
          
  //         // Step 2 Data
  //         items: selectedItems.map(i => ({
  //             item_id: i.id,
  //             quantity: i.needQty,
  //             price: i.unitPrice,
  //             type: i.type
  //         })),

  //         // Step 3 Data
  //         delivery_date: completionData.deliveryDate,
  //         delivery_time: completionData.deliveryTime,
  //         user_id: completionData.mechanic, // Mechanic Name/ID
  //         advance_amount: advance,
  //         bill_amount: totalAmount - advance,
          
  //         completion_datetime: `${completionData.completionDate} ${completionData.completionTime}`,
  //         exit_datetime: `${completionData.exitDate} ${completionData.exitTime}`,
  //         remind_period: completionData.reminderMonth,
          
  //         status: 'Open'
  //     };

  //     const response = await Axios.post(`${API_BASE_URL}/api/washing-jobs`, payload);
  //     if (response.data.success) {
  //       showAlert('Washing Job Created Successfully!', 'success');
  //       router.push('/WashingJobCardList/layout');
  //     }
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.message || 'Failed to create job';
  //     showAlert(`Error: ${errorMessage}`, 'error');
  //   } finally {
  //       setSaving(false);
  //   }
  // };

  // --- FINAL SUBMIT ---
  const handleSubmit = async () => {
    setSaving(true);
    try {
      // 1. Calculate Totals
      const totalAmount = selectedItems.reduce((acc, i) => acc + (i.needQty * i.unitPrice), 0);
      const advance = parseFloat(completionData.advanceAmount) || 0;

      // 2. Prepare Payload (Map camelCase state to snake_case DB columns)
      const payload = {
          // Step 1: Vehicle & Customer
          vehicle_no: formData.vehicleNo,
          vehicleNo: formData.vehicleNo,
          make: formData.make,
          model: formData.model,
          customer_name: formData.customerName,
          customerName: formData.customerName,
          mobile_number: formData.mobileNumber,
          mobileNumber: formData.mobileNumber,
          
          // Step 2: Items (Array)
          items: selectedItems.map(i => ({
              item_id: i.id,
              quantity: i.needQty,
              price: i.unitPrice,
              type: i.type
          })),

          // Step 3: Job Details (Use defaults if not filled yet)
          delivery_date: completionData.deliveryDate || null,
          delivery_time: completionData.deliveryTime || null,
          user_id: completionData.mechanic || null, // Ensure backend allows NULL if not set
          advance_amount: advance,
          bill_amount: totalAmount - advance,
          
          // Combine Date+Time strings for MySQL DATETIME
          completion_datetime: (completionData.completionDate && completionData.completionTime) 
            ? `${completionData.completionDate} ${completionData.completionTime}` 
            : null,
          
          exit_datetime: (completionData.exitDate && completionData.exitTime) 
            ? `${completionData.exitDate} ${completionData.exitTime}` 
            : null,
            
          remind_period: completionData.reminderMonth || '2 Month',
          
          status: 'Open'
      };

      console.log("Submitting Payload:", payload); // DEBUG: Check console for this

      const response = await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/washing-jobs`, payload);
      
      if (response.data.success) {
        showAlert('Washing Job Created Successfully!', 'success');
        router.push('/JobWashingList/layout');
      } else {
        throw new Error(response.data.message || "Failed to create job");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      showAlert(`Error: ${errorMessage}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none transition-colors appearance-none";
    const errorClass = "border-red-500 focus:ring-red-200 bg-red-50 focus:border-red-500";
    const normalClass = "border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white";
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  const filteredStock = stockItems.filter(i => (i.product_name || i.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const totalBill = selectedItems.reduce((acc, i) => acc + (i.needQty * i.unitPrice), 0);

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="bg-gray-50 min-h-screen font-sans">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-6 flex flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
                {currentStep === 1 ? 'New Washing Job' : currentStep === 2 ? 'Select Items' : 'Finalize Job'}
            </h1>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Step {currentStep} of 3</span>
          </header>

          {/* --- STEP 1: VEHICLE DETAILS --- */}
          {currentStep === 1 && (
              <form className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 p-4">
                  <h2 className="text-lg font-semibold text-white">New Washing Job - Details</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle No. <span className="text-red-500">*</span></label>
                      <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleChange} placeholder="MH27AB1234" className={getInputClass('vehicleNo')} />
                      <FieldError error={errors.vehicleNo} />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Make <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select name="make" value={formData.make} onChange={handleMakeChange} className={getInputClass('make')}>
                            <option value="">Select make</option>
                            {makes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </select>
                        <SelectArrowIcon />
                      </div>
                      <FieldError error={errors.make} />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <div className="relative">
                        <select name="model" value={formData.model} onChange={handleChange} className={getInputClass('model')}>
                            <option value="">Select model</option>
                            {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </select>
                        <SelectArrowIcon />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={getInputClass('customerName')} />
                      <FieldError error={errors.customerName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                      <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className={getInputClass('mobileNumber')} />
                      <FieldError error={errors.mobileNumber} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end items-center gap-3">
                  <button type="button" onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
                    Next &rarr;
                  </button>
                </div>
              </form>
          )}

          {/* --- STEP 2: CHOOSE ITEMS (Dynamic) --- */}
          {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[700px]">
                  <div className="bg-blue-600 px-6 py-3 flex justify-between items-center text-white">
                      <h2 className="text-lg font-semibold">Choose Items</h2>
                  </div>

                  <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                      {/* Left: Stock */}
                      <div className="w-full lg:w-1/2 flex flex-col border-r">
                          <div className="flex border-b">{['Jobs', 'Spare', 'Oil'].map(tab => (<button key={tab} onClick={() => {setActiveTab(tab); setSearchQuery('')}} className={`flex-1 py-3 text-sm font-medium transition ${activeTab===tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>{tab}</button>))}</div>
                          <div className="p-4 flex gap-2 border-b bg-gray-50">
                              <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center"><PlusIcon /> New</button>
                              <div className="relative flex-grow"><input type="text" placeholder="Search..." className="w-full pl-3 pr-8 py-2 border rounded text-sm" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} /></div>
                          </div>
                          <div className="flex-grow overflow-y-auto">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-white text-gray-600 font-semibold border-b sticky top-0"><tr><th className="p-3">Name</th><th className="p-3 text-center">Qty</th><th className="p-3">Price</th><th className="p-3 text-center">Action</th></tr></thead>
                                  <tbody className="divide-y">{filteredStock.map(item => (<tr key={item.id} className="hover:bg-blue-50"><td className="p-3 font-medium">{item.product_name||item.name}</td><td className="p-3 text-center">{item.stock||'-'}</td><td className="p-3">Rs.{item.unit_price}</td><td className="p-3 text-center"><button onClick={()=>handleAddItem(item)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded">Select</button></td></tr>))}</tbody>
                              </table>
                          </div>
                      </div>

                      {/* Right: Selected */}
                      <div className="w-full lg:w-1/2 flex flex-col bg-white">
                          <div className="p-3 bg-gray-100 border-b font-semibold text-gray-700">Selected Items</div>
                          <div className="flex-grow overflow-y-auto p-4">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-gray-50 border-b"><tr><th className="p-3">Name</th><th className="p-3 w-16 text-center">Qty</th><th className="p-3 w-20 text-right">Price</th><th className="p-3 text-right">Total</th><th className="p-3 w-10"></th></tr></thead>
                                  <tbody className="divide-y">{selectedItems.map(item => (<tr key={item.id}><td className="p-3">{item.name}</td><td className="p-3 text-center"><input type="number" min="1" className="w-12 border text-center" value={item.needQty} onChange={(e) => handleItemChange(item.id, 'needQty', e.target.value)}/></td><td className="p-3 text-right"><input type="number" className="w-20 border text-right" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}/></td><td className="p-3 text-right">{(item.needQty*item.unitPrice).toFixed(0)}</td><td className="p-3 text-center"><button onClick={()=>handleRemoveItem(item.id)} className="text-red-500"><TrashIcon /></button></td></tr>))}</tbody>
                              </table>
                          </div>
                          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                              <button onClick={handlePrevStep} className="px-4 py-2 border rounded bg-white hover:bg-gray-100">Previous</button>
                              <button onClick={handleNextStep} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Next &rarr;</button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* --- STEP 3: FINALIZE (New Form) --- */}
          {currentStep === 3 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-blue-600 px-6 py-4"><h2 className="text-lg font-semibold text-white">Finalize Job</h2></div>
                  <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <FormField label="Delivery Date" name="deliveryDate" type="date" value={completionData.deliveryDate} onChange={handleCompletionChange} required />
                          <FormField label="Delivery Time" name="deliveryTime" type="time" value={completionData.deliveryTime} onChange={handleCompletionChange} />
                          <FormField label="Select Mechanic" name="mechanic" type="select" value={completionData.mechanic} onChange={handleCompletionChange} required>
                              <option value="">Select Mechanic</option>
                              {mechanicsList.map(m => <option key={m} value={m}>{m}</option>)}
                          </FormField>
                          <FormField label="Advance Amount" name="advanceAmount" type="number" value={completionData.advanceAmount} onChange={handleCompletionChange} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <div><label className="block text-sm font-bold text-gray-700 mb-1">Bill Amount</label><input type="text" value={totalBill} readOnly className="w-full px-3 py-2 border bg-gray-100 font-bold text-gray-800 rounded-md" /></div>
                          <FormField label="Completion Date" name="completionDate" type="date" value={completionData.completionDate} onChange={handleCompletionChange} />
                          <FormField label="Completion Time" name="completionTime" type="time" value={completionData.completionTime} onChange={handleCompletionChange} />
                          <FormField label="Exit Date" name="exitDate" type="date" value={completionData.exitDate} onChange={handleCompletionChange} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                          <FormField label="Exit Time" name="exitTime" type="time" value={completionData.exitTime} onChange={handleCompletionChange} />
                          <FormField label="Select Reminder" name="reminderMonth" type="select" value={completionData.reminderMonth} onChange={handleCompletionChange}>
                              <option value="1 Month">1 Month</option><option value="2 Month">2 Month</option><option value="3 Month">3 Month</option><option value="6 Month">6 Month</option>
                          </FormField>
                          <div><label className="block text-sm font-bold text-green-700 mb-1">Balance</label><input type="text" value={totalBill - parseFloat(completionData.advanceAmount || 0)} readOnly className="w-full px-3 py-2 border border-green-300 bg-green-50 font-bold text-green-800 rounded-md" /></div>
                      </div>

                      <div className="flex justify-end pt-6 border-t gap-3">
                          <button onClick={handlePrevStep} className="px-5 py-2.5 border rounded hover:bg-gray-50">Previous</button>
                          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 font-bold disabled:opacity-50">
                              {saving ? 'Creating...' : 'Create Jobcard'}
                          </button>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}