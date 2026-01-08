






"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import EstimationModal from '@/app/components/EstimationModal.jsx';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useAlert } from '../../context/AlertContext';
import Link from 'next/link';

// --- Icons ---
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;

const EditJobCard = () => {
    const { id } = useParams();
    const router = useRouter(); 
    const { showAlert, showConfirm } = useAlert();

    // --- State Management ---
    const [currentStep, setCurrentStep] = useState(1); // 1 = Details, 2 = Parts/Services, 3 = Finalize
    
    // Step 2 States (Parts & Services)
    const [activeTab, setActiveTab] = useState('Jobs'); // 'Jobs', 'Spare', 'Oils'
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartIdCounter, setCartIdCounter] = useState(1);
    const [currentPage, setCurrentPage] = useState(1); // Pagination State

    // Stock States
    const [jobs, setJobs] = useState([]);
    const [spares, setSpares] = useState([]);
    const [oils, setOils] = useState([]);
    const [isLoadingStock, setIsLoadingStock] = useState(false);

    // New Item Modal State
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [newItemData, setNewItemData] = useState({ name: '', price: '', type: 'Jobs' });
    const [isCreatingItem, setIsCreatingItem] = useState(false);

    // Step 1 States
    const [jobCard, setJobCard] = useState({
        vehicleNo: '', make: '', model: '', runningKm: '', customerName: '', mobileNumber: '',
        estimate: '', serviceOption: 'Servicing', customerVoice: '', status: 'Pending',
        creationDate: '', updationDate: '', deliveryDate: '', deliveryTime: '',
        completionDateTime: '', closedDateTime: '', reminder1: '', reminder2: '',
    });

    // --- NEW: Step 3 State ---
    const [step3Data, setStep3Data] = useState({
        mechanic: '',
        reminderMonth: '6', // Default
        advanceAmount: '',
        discountAmount: '',
        deliveryDate: '', 
        deliveryTime: ''
    });

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [isEstimationModalOpen, setEstimationModalOpen] = useState(false);

    // Placeholder Mechanics list
    const mechanicsList = ['Amit Sharma', 'Rahul Verma', 'Suresh Mechanic'];

    // --- Dynamic Calculations ---
    const calculateTotal = (type) => selectedItems.filter(i => i.type === type).reduce((sum, i) => sum + (parseFloat(i.price || 0) * i.qty), 0);
    const labourCharges = calculateTotal('job');
    const sparePartCharges = calculateTotal('spare');
    const oilCharges = calculateTotal('oil');
    const totalEstimate = labourCharges + sparePartCharges + oilCharges;
    const discount = parseFloat(step3Data.discountAmount) || 0;
    const advance = parseFloat(step3Data.advanceAmount) || 0;
    const billAmount = totalEstimate - discount;
    const balanceAmount = billAmount - advance;

    // Filter Logic
    const dataMap = { Jobs: jobs, Spare: spares, Oils: oils };
    const currentList = dataMap[activeTab] || [];
    const filteredItems = currentList.filter(item => 
        (item.product_name || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Pagination Logic ---
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when tab or search changes
    }, [activeTab, searchQuery]);

    // --- Fetch Stock Function ---
    const fetchStockData = async () => {
        setIsLoadingStock(true);
        try {
            const [jobsRes, sparesRes, oilsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=job`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=spare`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stock?category=oil`)
            ]);
            if (jobsRes.data.success) setJobs(jobsRes.data.data);
            if (sparesRes.data.success) setSpares(sparesRes.data.data);
            if (oilsRes.data.success) setOils(oilsRes.data.data);
        } catch (error) { 
            console.error("Failed to fetch stock data:", error); 
        } finally { 
            setIsLoadingStock(false); 
        }
    };

    // Trigger Fetch when entering Step 2
    useEffect(() => {
        if (currentStep === 2) {
            fetchStockData();
        }
    }, [currentStep]);

    // --- MAIN DATA LOADING LOGIC ---
    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Makes List FIRST
                const makesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/makes`);
                const makesList = Array.isArray(makesRes.data) ? makesRes.data : makesRes.data.makes || [];
                setMakes(makesList);

                // 2. Fetch Job Card Data
                const jobCardRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobcards/${id}`);
                const dbData = jobCardRes.data.data || jobCardRes.data;

                // 3. Set Job Card State

                // --- Load existing items into the cart ---
                let counter = 0;
                const loadedItems = [
                    ...(dbData.jobs || []),
                    ...(dbData.oils || []),
                    ...(dbData.spares || [])
                ];
                const formattedItems = loadedItems.map(item => {
                    counter++;
                    return {
                        id: item.id, // This is the jobcard_items.id
                        cartId: counter, // Unique ID for table keys
                        name: item.item_name,
                        price: parseFloat(item.rate) || 0,
                        stock: 'N/A', // Stock info isn't available for already-saved items
                        type: item.type,
                        qty: parseInt(item.quantity) || 1,
                    }
                });
                
                setSelectedItems(formattedItems);
                setCartIdCounter(counter + 1);

                setJobCard(prev => ({
                    ...prev,
                    vehicleNo:      dbData.vehicleNo || dbData.vehicle_no || '',
                    runningKm:      dbData.runningKm || dbData.running_km || '',
                    customerName:   dbData.customerName || dbData.customer_name || '',
                    mobileNumber:   dbData.mobileNumber || dbData.mobile_number || '',
                    estimate:       dbData.estimate || '',
                    serviceOption:  dbData.serviceOption || dbData.service_option || 'Servicing',
                    customerVoice:  dbData.customerVoice || dbData.customer_voice || '',
                    status:         dbData.status || 'Pending',
                    make:           dbData.make || '', 
                    model:          dbData.model || '',
                    deliveryDate:   dbData.deliveryDate || dbData.delivery_date || '',
                    deliveryTime:   dbData.deliveryTime || dbData.delivery_time || '',
                    reminder1:      dbData.reminder1 || dbData.reminder_1 || '',
                    reminder2:      dbData.reminder2 || dbData.reminder_2 || '',
                    creationDate:   dbData.created_at || '',
                    updationDate:   dbData.updated_at || '',
                    completionDateTime: dbData.completionDateTime || dbData.completion_datetime || '',
                }));

                // Initialize Step 3 data
                setStep3Data({
                    mechanic: dbData.mechanic || '',
                    reminderMonth: '6', // Default or derived logic could go here
                    advanceAmount: dbData.advanceAmount || dbData.advance_amount || '',
                    discountAmount: dbData.discountAmount || dbData.discount_amount || '',
                    deliveryDate: dbData.deliveryDate || dbData.delivery_date || '',
                    deliveryTime: dbData.deliveryTime || dbData.delivery_time || ''
                });

                // 4. Fetch Models immediately if make exists
                if (dbData.make) {
                    fetchModels(dbData.make); 
                }

            } catch (error) {
                console.error("Error loading data:", error);
                showAlert('Failed to load data.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    const fetchModels = async (makeValue) => {
        setIsLoadingModels(true);
        try {
            if(!makeValue) { setModels([]); return; }
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/models?make=${makeValue}`);
            setModels(Array.isArray(response.data) ? response.data : response.data.models || []);
        } catch (error) { setModels([]); } finally { setIsLoadingModels(false); }
    };

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setJobCard(prev => ({ ...prev, [name]: value }));
    };

    const handleQtyChange = (cartId, newQty) => {
        const qty = parseInt(newQty);
        if (isNaN(qty) || qty < 1) return; // Prevent invalid or zero quantity

        setSelectedItems(prev => 
            prev.map(item => 
                (item.cartId === cartId || item.id === cartId) ? { ...item, qty: qty } : item
            )
        );
    };
    const handleStep3Change = (e) => {
        const { name, value } = e.target;
        setStep3Data(prev => ({ ...prev, [name]: value }));
    };

    const handleMarkComplete = async () => {
        const confirmed = await showConfirm('Mark this job as Completed?', 'Confirm Completion');
        if (!confirmed) return;

        try {
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/jobcards/${id}/status`,
                { status: 'Completed' }
            );

            if (res.data.success) {
                setJobCard(prev => ({ ...prev, status: 'Completed' }));
                showAlert('Job Card marked as Completed!', 'success');
            } else {
                showAlert('Failed to update status.', 'error');
            }
        } catch (error) {
            console.error("Status Update Error:", error);
            showAlert('Error updating status.', 'error');
        }
    };

    const handleAddItem = (item) => {
        // Check if item already exists using the current state value
        const existingItem = selectedItems.find(i => i.id === item.id);

        if (existingItem) {
            // If it exists, update the quantity
            setSelectedItems(prev => 
                prev.map(i => 
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                )
            );
            // Then, show the alert as a separate action
            showAlert(`${item.product_name || item.name} quantity increased`, 'success');
        } else {
            // If it doesn't exist, add it as a new item
            const typeMap = { 'Jobs': 'job', 'Spare': 'spare', 'Oils': 'oil' };
            const itemType = typeMap[activeTab] || 'job';
            
            const newCartId = cartIdCounter;
            setCartIdCounter(c => c + 1);

            setSelectedItems(prev => [...prev, { 
                    id: item.id, 
                    cartId: newCartId,
                    name: item.product_name || item.name, 
                    price: parseFloat(item.unit_price || item.price) || 0, 
                    stock: item.stock || '-', 
                    type: itemType, 
                    qty: 1 
                }]);
        }
    };

    const handleRemoveItem = (cartIdToRemove) => {
        setSelectedItems(prev => prev.filter(item => item.cartId !== cartIdToRemove && item.id !== cartIdToRemove));
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!jobCard.vehicleNo || !jobCard.customerName) {
                showAlert("Please fill Vehicle No & Customer Name", "error");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    };

    const handlePreviousStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Calculate Reminder Date based on Step 3 selection
            let reminderDate = null;
            if (step3Data.deliveryDate && step3Data.reminderMonth) {
                const date = new Date(step3Data.deliveryDate); // Use Step 3 delivery date
                date.setMonth(date.getMonth() + parseInt(step3Data.reminderMonth));
                reminderDate = date.toISOString().split('T')[0];
            } else if (jobCard.deliveryDate && step3Data.reminderMonth) {
                 // Fallback to jobCard delivery date if Step 3 specific isn't set yet but carried over
                 const date = new Date(jobCard.deliveryDate);
                 date.setMonth(date.getMonth() + parseInt(step3Data.reminderMonth));
                 reminderDate = date.toISOString().split('T')[0];
            }

            const payload = {
                ...jobCard, // Spreads vehicleNo, make, model, etc.
                // Step 3 Data Overrides
                deliveryDate: step3Data.deliveryDate || jobCard.deliveryDate, // Prioritize Step 3 input
                deliveryTime: step3Data.deliveryTime || jobCard.deliveryTime,
                mechanic: step3Data.mechanic,
                reminderMonth: step3Data.reminderMonth, // Added missing field
                reminder1: reminderDate,
                advanceAmount: step3Data.advanceAmount || 0,
                discountAmount: step3Data.discountAmount || 0,
                estimate: totalEstimate > 0 ? totalEstimate : jobCard.estimate, // Prevent overwriting with 0 if items aren't changed
                billAmount: billAmount > 0 ? billAmount : 0,
                balanceAmount: balanceAmount,
                items: selectedItems 
            };
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobcards/${id}`, payload);
            showAlert('Job Card saved successfully', 'success');
        } catch (error) {
            console.error("Error Saving:", error);
            showAlert('Failed to save Job Card.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm('Delete Job Card?', 'Delete Job Card');
        if (!confirmed) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/jobcards/${id}`);
            showAlert('Job card deleted successfully', 'success');
            router.push('/JobCardList/layout'); 
        } catch (error) {
            showAlert('Failed to remove Job Card.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- UPDATED: Handle Create Item correctly ---
    const handleCreateItem = async () => {
        if (!newItemData.name || !newItemData.price) {
            showAlert("Please fill all required fields", "error");
            return;
        }
        setIsCreatingItem(true);
        try {
            // Map UI type to Backend Category
            const typeMap = { 'Jobs': 'job', 'Spare': 'spare', 'Oils': 'oil' };
            const category = typeMap[newItemData.type] || 'job';

            // 1. Prepare Payload matching Database Columns
            const payload = {
                productName: newItemData.name, 
                unitPrice: newItemData.price,
                category: category,
                stock: 0
            };
            
            // 2. Send Request
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/stock`, payload);
            
            if (res.data.success) {
                showAlert("Item added successfully", "success");
                
                // 3. Create Local Object to Update UI Immediately
                const newItemForList = {
                    id: res.data.itemId || res.data.insertId || Date.now(),
                    product_name: newItemData.name,
                    unit_price: newItemData.price,
                    stock: 0, 
                    type: category // Use lowercase category for consistency
                };

                // 4. Update the specific list based on category
                if (newItemData.type === 'Jobs') {
                    setJobs(prev => [newItemForList, ...prev]);
                } else if (newItemData.type === 'Spare') {
                    setSpares(prev => [newItemForList, ...prev]);
                } else if (newItemData.type === 'Oils') {
                    setOils(prev => [newItemForList, ...prev]);
                }

                // 5. Switch tab & reset
                setActiveTab(newItemData.type);
                setIsNewItemModalOpen(false);
                setNewItemData({ name: '', price: '', type: 'Jobs' });
            }
        } catch (error) {
            console.error("Error creating item:", error);
            showAlert("Failed to create item", "error");
        } finally {
            setIsCreatingItem(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <EstimationModal isOpen={isEstimationModalOpen} onClose={() => setEstimationModalOpen(false)} jobCardId={id} />
            
            {/* --- Add Item Modal --- */}
            {isNewItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Add New Item</h3>
                            <button onClick={() => setIsNewItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product name *</label>
                                <input type="text" value={newItemData.name} onChange={(e) => setNewItemData({...newItemData, name: e.target.value})} className="block w-full rounded-md border-gray-800 border shadow-sm p-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Unit Price *</label>
                                <input type="number" value={newItemData.price} onChange={(e) => setNewItemData({...newItemData, price: e.target.value})} className="block w-full rounded-md border-gray-300 border shadow-sm p-2.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                                <div className="flex gap-4">
                                    {['Jobs', 'Spare', 'Oils'].map((type) => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="itemType" value={type} checked={newItemData.type === type} onChange={(e) => setNewItemData({...newItemData, type: e.target.value})} className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                            <button onClick={handleCreateItem} disabled={isCreatingItem} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded shadow hover:bg-blue-700 disabled:opacity-50">{isCreatingItem ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => setIsNewItemModalOpen(false)} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded shadow-sm hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col min-h-screen w-full bg-gray-50">
                <Header />
                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {currentStep === 1 ? 'Edit Job Card' : currentStep === 2 ? 'Select Spare Parts & Services' : 'Finalize Job Card'}
                            </h1>
                            <nav className="flex text-sm text-gray-500 mt-2">
                                <Link href="/" className="hover:text-blue-600">Home</Link>
                                <span className="mx-2">/</span>
                                <span className="text-gray-900">Job Card #{id}</span>
                                <span className="mx-2">|</span>
                                <span className="text-blue-600 font-medium">Step {currentStep} of 3</span>
                            </nav>
                        </div>
                    </div>

                    {/* --- STEP 1: Basic Information --- */}
                    {currentStep === 1 && (
                        <>
                            {/* <div className="flex justify-end gap-3 mb-6">
                                <button onClick={handleNextStep} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Next Step &rarr;</button>
                                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                            </div> */}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                            <CarIcon /><h2 className="text-lg font-semibold text-gray-800">Vehicle Information</h2>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No *</label>
                                                <input type="text" name="vehicleNo" value={jobCard.vehicleNo} onChange={handleChange} className="block w-full border rounded-lg border-gray-300 shadow-sm py-2.5 px-3 uppercase" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Running KM</label>
                                                <input type="number" name="runningKm" value={jobCard.runningKm} onChange={handleChange} className="block w-full border rounded-lg border-gray-300 shadow-sm py-2.5 px-3" />
                                            </div>
                                            
                                            {/* --- MAKE SELECT --- */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                                <input type="text" name="make" value={jobCard.make || ''} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border shadow-sm py-2.5 px-3" />
                                            </div>

                                            {/* --- MODEL SELECT --- */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                                <input type="text" name="model" value={jobCard.model || ''} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border shadow-sm py-2.5 px-3" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2"><UserIcon /><h2 className="text-lg font-semibold text-gray-800">Customer Details</h2></div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                                <input type="text" name="customerName" value={jobCard.customerName} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border shadow-sm py-2.5 px-3" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                                <input type="text" name="mobileNumber" value={jobCard.mobileNumber} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border shadow-sm py-2.5 px-3" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 space-y-4">
                                            <label className="block text-sm font-medium text-gray-700">Service Type</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Servicing', 'Repair', 'Both'].map((type) => (
                                                    <label key={type} className={`flex items-center justify-center px-4 py-3 rounded-lg border cursor-pointer ${jobCard.serviceOption === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                                                        <input type="radio" name="serviceOption" value={type} checked={jobCard.serviceOption === type} onChange={handleChange} className="sr-only" />
                                                        <span className="text-sm font-medium">{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Voice</label>
                                                <textarea name="customerVoice" value={jobCard.customerVoice} onChange={handleChange} rows="3" className="block w-full rounded-lg border-gray-300 border shadow-sm focus:border-blue-500 sm:text-sm p-3"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col min-h-screen">
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Current Status</h3>
                                        <div className="mb-6">
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${jobCard.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {jobCard.status}
                                            </span>
                                        </div>
                                        {jobCard.status !== 'Completed' && (
                                            <button onClick={handleMarkComplete} className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Mark as Completed</button>
                                        )}
                                        {jobCard.status === 'Completed' && (
                                            <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed border border-gray-200">Already Completed</button>
                                        )}
                                    </div>
                                    
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
                                         <button onClick={() => setEstimationModalOpen(true)} className="w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">View Estimation</button>
                                         <button onClick={handleDelete} className="w-full py-2.5 border border-transparent bg-red-50 text-red-700 rounded-lg hover:bg-red-100">Delete Job Card</button>
                                    </div>
                                     <div className="flex justify-center gap-10 mt-auto pb-6 ">
                                        <button onClick={handleNextStep} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Next Step &rarr;</button>
                                        <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                    </div>
                                </div>
                                
                            </div>
                        </>
                    )}

                    {/* --- STEP 2: Select Parts & Services --- */}
                    {currentStep === 2 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-600 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white">Select Spare Parts & Services</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
                                {/* LEFT: Item List */}
                                <div className="border-r border-gray-200 flex flex-col">
                                    <div className="flex border-b border-gray-200">
                                        {['Jobs', 'Spare', 'Oils'].map(tab => (
                                            <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }} className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>{tab}</button>
                                        ))}
                                    </div>
                                    <div className="p-4 border-b border-gray-200 flex gap-2">
                                        <button onClick={() => setIsNewItemModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">+ New</button>
                                        <div className="flex-1 relative">
                                            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" />
                                            <button className="absolute right-0 top-0 h-full px-3 bg-teal-600 text-white rounded-r text-sm font-medium">Search</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                        {isLoadingStock ? <div className="flex justify-center items-center h-full text-gray-400">Loading...</div> : filteredItems.length === 0 ? <div className="p-4 text-center text-gray-500 text-sm">No items found.</div> : 
                                            paginatedItems.map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50 transition-colors">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.product_name || item.name}</p>
                                                        {item.type !== 'Jobs' && <span className="text-xs text-gray-500">Stock: <span className={item.stock < 5 ? 'text-red-500 font-bold' : 'text-green-600'}>{item.stock || '-'}</span></span>}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-semibold text-gray-700">Rs. {item.unit_price || item.price}</span>
                                                        <button onClick={() => handleAddItem(item)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded shadow-sm hover:bg-blue-700">Select</button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>

                                    {/* --- Pagination Controls --- */}
                                    {totalPages > 1 && (
                                        <div className="p-3 border-t border-gray-200 flex justify-center items-center gap-2 bg-gray-50">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let p = i + 1;
                                                    if (totalPages > 5) {
                                                        if (currentPage > 3) p = currentPage - 2 + i;
                                                        if (p > totalPages) p = totalPages - (4 - i);
                                                        if (p < 1) p = i + 1;
                                                    }
                                                    return (
                                                        <button
                                                            key={p}
                                                            onClick={() => setCurrentPage(p)}
                                                            className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded border ${
                                                                currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: Selected Items */}
                                <div className="flex flex-col bg-white h-full overflow-hidden">
                                     <div className="p-4 border-b border-gray-200"><h3 className="text-base font-semibold text-gray-800">Selected Items</h3></div>
                                     <div className="flex-1 overflow-y-auto p-4">
                                         {selectedItems.length === 0 ? (
                                             <div className="text-center text-gray-400 mt-10">No selected item found.</div>
                                         ) : (
                                             <table className="w-full text-sm text-left border border-gray-200">
                                                 <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                                                     <tr>
                                                         <th className="py-3 px-4">Item Name</th>
                                                         <th className="py-3 px-2 text-center">Avail. Qty.</th>
                                                         <th className="py-3 px-2 text-center w-24">Need Qty.</th>
                                                         <th className="py-3 px-2 text-right">Unit Price</th>
                                                         <th className="py-3 px-4 text-right">Total Amount</th>
                                                         <th className="py-3 px-2 text-center">Action</th>
                                                     </tr>
                                                 </thead>
                                                 <tbody className="divide-y divide-gray-100">
                                                     {selectedItems.map((item) => (
                                                         <tr key={item.cartId || item.id} className="hover:bg-gray-50">
                                                             <td className="py-3 px-4">
                                                                 <div className="font-medium text-gray-800">{item.name}</div>
                                                             </td>
                                                             <td className="py-3 px-2 text-center text-gray-500">
                                                                 {item.type === 'job' ? '-' : item.stock}
                                                             </td>
                                                             <td className="py-3 px-2 text-center">
                                                                 <input 
                                                                     type="number" 
                                                                     min="1" 
                                                                     className="w-16 border border-gray-300 rounded px-2 py-1 text-center focus:outline-blue-500" 
                                                                     value={item.qty}
                                                                     onChange={(e) => handleQtyChange(item.cartId || item.id, e.target.value)}
                                                                 />
                                                             </td>
                                                             <td className="py-3 px-2 text-right text-gray-600">{item.price}</td>
                                                             <td className="py-3 px-4 text-right font-bold text-gray-800">{(item.qty * item.price).toFixed(0)}</td>
                                                             <td className="py-3 px-2 text-center">
                                                                 <button onClick={() => handleRemoveItem(item.cartId || item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">
                                                                     &times;
                                                                 </button>
                                                             </td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                                 {/* Grand Total Row */}
                                                 <tfoot className="bg-gray-50 border-t border-gray-200">
                                                     <tr>
                                                         <td colSpan="4" className="py-3 px-4 text-right font-bold text-gray-700">Grand Total:</td>
                                                         <td className="py-3 px-4 text-right font-bold text-gray-900">Rs. {totalEstimate.toFixed(0)}</td>
                                                         <td></td>
                                                     </tr>
                                                 </tfoot>
                                             </table>
                                         )}
                                     </div>
                                     <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
                                         <button onClick={() => setCurrentStep(1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Previous</button>
                                         <button onClick={handleNextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Next</button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- NEW: STEP 3: Finalize Job Card --- */}
                    {currentStep === 3 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-600 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white">Step 3: Finalize Job Card</h2>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                
                                {/* 1. Delivery Details */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Date *</label>
                                    <input type="date" name="deliveryDate" value={step3Data.deliveryDate} onChange={handleStep3Change} className="block w-full rounded-md border-gray-300 shadow-sm p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Time</label>
                                    <input type="time" name="deliveryTime" value={step3Data.deliveryTime} onChange={handleStep3Change} className="block w-full rounded-md border-gray-300 shadow-sm p-2.5 border" />
                                </div>
                                
                                {/* 2. Mechanic & Reminder */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Mechanic *</label>
                                    <select name="mechanic" value={step3Data.mechanic} onChange={handleStep3Change} className="block w-full rounded-md border-gray-300 shadow-sm p-2.5 border">
                                        <option value="">Select Mechanic</option>
                                        {mechanicsList.map((m, i) => <option key={i} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Reminder Month</label>
                                    <select name="reminderMonth" value={step3Data.reminderMonth} onChange={handleStep3Change} className="block w-full rounded-md border-gray-300 shadow-sm p-2.5 border">
                                        <option value="">Select Month</option>
                                        <option value="1">1 Month</option>
                                        <option value="3">3 Month</option>
                                        <option value="6">6 Month</option>
                                        <option value="12">12 Month</option>
                                    </select>
                                </div>

                                <div className="col-span-full border-t border-gray-100 my-2"></div>

                                {/* 3. Charges Section (Read Only - Calculated from Step 2) */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Labour Charges</label>
                                    <input type="number" value={labourCharges} disabled className="block w-full bg-transparent border-none font-semibold text-gray-900" />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Sparepart Charge</label>
                                    <input type="number" value={sparePartCharges} disabled className="block w-full bg-transparent border-none font-semibold text-gray-900" />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Oil Charges</label>
                                    <input type="number" value={oilCharges} disabled className="block w-full bg-transparent border-none font-semibold text-gray-900" />
                                </div>
                                
                                <div className="hidden lg:block"></div>

                                <div className="col-span-full border-t border-gray-100 my-2"></div>

                                {/* 4. Payment Section (Editable) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Advance Amount</label>
                                    <input type="number" name="advanceAmount" value={step3Data.advanceAmount} onChange={handleStep3Change} className="block w-full rounded-md border-gray-300 shadow-sm p-2.5 border" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Discount Amount</label>
                                    <input type="number" name="discountAmount" value={step3Data.discountAmount} onChange={handleStep3Change} className="block w-full rounded-md border-gray-300 shadow-sm p-2.5 border" placeholder="0" />
                                </div>

                                {/* 5. Final Bill (Calculated) */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <label className="block text-sm font-bold text-blue-800 mb-1">Total Bill Amount</label>
                                    <div className="text-2xl font-bold text-blue-700">₹ {billAmount.toFixed(2)}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <label className="block text-sm font-bold text-green-800 mb-1">Balance Due</label>
                                    <div className="text-2xl font-bold text-green-700">₹ {balanceAmount.toFixed(2)}</div>
                                </div>

                            </div>

                            {/* Footer Buttons */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                <button onClick={handlePreviousStep} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">Previous</button>
                                <button onClick={() => setEstimationModalOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">View Estimation</button>
                                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                                    {isSaving ? 'Saving...' : 'Save Jobcard'}
                                </button>
                            </div>
                        </div>
                    )}

                </main>
                <Footer />
            </div>
        </>
    );
};

export default EditJobCard;