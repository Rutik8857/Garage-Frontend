




"use client";
import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import AddCustomerModal from '../AddNewCustomer/AddCustomerModal';
import axios from 'axios';
import { 
    Trash2, 
    Plus, 
    Search, 
    Calendar, 
    FileText, 
    CheckCircle, 
    Loader2 
} from 'lucide-react';

export default function BalanceSheetPage() {
    // Safe API base: trim and remove trailing slashes from env var
    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/g, '') || '';
    // --- Form State ---
    const [formData, setFormData] = useState({
        customerId: '',
        particulars: '',
        remark: '',
        vchType: '',
        vchNumber: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: ''
    });

    // --- Validation State ---
    const [errors, setErrors] = useState({});

    // --- Data State ---
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // --- UI State ---
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // --- Fetch Data on Load ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const [custRes, transRes] = await Promise.all([
                axios.get(`${API_BASE}/api/customers`),
                axios.get(`${API_BASE}/api/transactions`)
            ]);

            if (custRes.data.success) setCustomers(custRes.data.data);
            if (transRes.data.success) setTransactions(transRes.data.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setErrorMsg('Could not load data. Please check your connection.');
        } finally {
            setIsLoadingData(false);
        }
    };

    // --- Helper: Get Input Class for Validation ---
    const getInputClass = (fieldName) => {
        const baseClass = "w-full rounded-md shadow-sm sm:text-sm py-2 px-3 border transition-all focus:outline-none focus:ring-2";
        const errorClass = "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50";
        const normalClass = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white";
        
        return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
    };

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['customerId', 'particulars', 'vchType', 'amount', 'date', 'status'];
        
        let isValid = true;
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = true;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!validateForm()) {
            setErrorMsg('Please fill in all highlighted fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                customer: formData.customerId,
                particulars: formData.particulars,
                remark: formData.remark,
                vchType: formData.vchType,
                vchNumber: formData.vchNumber,
                amount: parseFloat(formData.amount),
                date: formData.date,
                status: formData.status
            };

            const response = await axios.post(`${API_BASE}/api/transactions`, payload);

            if (response.data.id || response.data.success) {
                // Reset Form
                setFormData({
                    customerId: '', particulars: '', remark: '', vchType: '', 
                    vchNumber: '', amount: '', status: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setErrors({});
                fetchData(); // Refresh list
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to save transaction.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Are you sure you want to delete this transaction?")) return;
        try {
            await axios.delete(`${API_BASE}/api/transactions/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete item.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            
            <main className="flex-grow container mx-auto px-4 sm:px-6 py-8">
                
                {/* Page Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage daily transactions and accounts.</p>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center animate-in fade-in slide-in-from-top-2">
                        <span className="mr-2">⚠️</span> {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Entry Form */}
                    <div className="lg:col-span-4 h-fit lg:sticky lg:top-24">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h2 className="text-white font-semibold flex items-center gap-2">
                                    <FileText size={20} /> New Transaction
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Customer Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Customer <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="customerId"
                                            value={formData.customerId}
                                            onChange={handleChange}
                                            className={getInputClass('customerId')}
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.customer_name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                                            title="Add New Customer"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    {errors.customerId && <p className="text-xs text-red-500 mt-1">Customer is required</p>}
                                </div>

                                {/* Particulars */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Particulars <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="particulars" 
                                        value={formData.particulars} 
                                        onChange={handleChange} 
                                        className={getInputClass('particulars')}
                                        placeholder="e.g. Oil Purchase"
                                    />
                                    {errors.particulars && <p className="text-xs text-red-500 mt-1">Particulars required</p>}
                                </div>
                                
                                {/* Remark */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                    <textarea
                                        name="remark"
                                        rows="2"
                                        value={formData.remark}
                                        onChange={handleChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2 px-3 focus:outline-none focus:ring-2"
                                        placeholder="Optional details..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Vch Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vch Type <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            name="vchType" 
                                            value={formData.vchType} 
                                            onChange={handleChange} 
                                            className={getInputClass('vchType')}
                                        >
                                            <option value="">Select</option>
                                            <option value="Receipt">Receipt</option>
                                            <option value="Payment">Payment</option>
                                        </select>
                                    </div>

                                    {/* Vch No */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vch No</label>
                                        <input 
                                            type="text" 
                                            name="vchNumber" 
                                            value={formData.vchNumber} 
                                            onChange={handleChange} 
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border py-2 px-3 focus:outline-none focus:ring-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            name="amount" 
                                            value={formData.amount} 
                                            onChange={handleChange} 
                                            className={getInputClass('amount')}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            name="date" 
                                            value={formData.date} 
                                            onChange={handleChange} 
                                            className={getInputClass('date')}
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleChange} 
                                        className={getInputClass('status')}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Debit">Debit</option>
                                        <option value="Credit">Credit</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                                >
                                    {isSubmitting ? (
                                        <> <Loader2 className="animate-spin" size={18} /> Saving... </>
                                    ) : (
                                        <> <CheckCircle size={18} /> Submit Transaction </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Table & Filters */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Filter Bar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:flex-1">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Filter Customer</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <select className="w-full pl-9 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 border h-10 bg-white">
                                        <option value="">All Customers</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date Range</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input type="text" placeholder="Select Dates" className="w-full pl-9 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 border h-10" />
                                </div>
                            </div>
                            <button className="w-full md:w-auto px-6 h-10 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 transition-colors">
                                Apply Filter
                            </button>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Particulars</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoadingData ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <Loader2 className="animate-spin text-blue-600" /> Loading transactions...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic">No transactions found.</td>
                                            </tr>
                                        ) : (
                                            transactions.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                                                                {t.customer?.charAt(0) || 'C'}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900">{t.customer}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{t.particulars}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.vchType}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        ₹{t.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            t.status === 'Credit' 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button 
                                                            onClick={() => handleDelete(t.id)} 
                                                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                                            title="Delete Transaction"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination (Visual Only for now) */}
                            {!isLoadingData && transactions.length > 0 && (
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing <span className="font-medium">1</span> to <span className="font-medium">{transactions.length}</span> of <span className="font-medium">{transactions.length}</span> results
                                    </div>
                                    <div className="flex space-x-1">
                                        <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                                        <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AddCustomerModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchData();
                }} 
            />
            
            <Footer />
        </div>
    );
}
