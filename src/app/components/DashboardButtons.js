



"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Footer from './Footer';
import Link from "next/link"; 
import axios from 'axios';
import { Maximize2, Minimize2, Filter, Calendar, X, PieChart as PieIcon } from 'lucide-react'; 
import { useAlert } from '../context/AlertContext';

const PIE_COLORS = {
  Pending: '#FFBB28',
  Completed: '#00C49F',
  Closed: '#8884d8',
};

// --- Reusable Navigation Card (Made Responsive) ---
const DashboardCard = ({ title, children, href, colorClassName }) => (
    <Link
      href={href}
      className={`
        w-full sm:w-auto flex-1 flex flex-col items-center justify-center 
        min-h-[100px] sm:min-w-[150px] md:min-w-[200px] xl:min-w-[250px]
        text-center p-4 sm:p-6 rounded-xl shadow-md font-bold text-gray-800 text-base sm:text-lg 
        transition-all duration-300 ease-in-out transform
        hover:scale-105 active:scale-95 translate-y-2 shadow-xl bg-gradient-to-br ${colorClassName}
      `}
    >
      {children}
      <span className="mt-2">{title}</span>
    </Link>
);

const StaticBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip />
      <Legend wrapperStyle={{ paddingTop: '10px' }} />
      <Bar dataKey="revenue" name="Revenue (₹)" fill="#8884d8" barSize={30} />
    </BarChart>
  </ResponsiveContainer>
);

// --- UPDATED STATIC PIE CHART ---
const StaticPieChart = ({ data }) => {
  const activeData = data.filter(item => item.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="h-[250px] sm:h-[300px] flex flex-col items-center justify-center text-gray-400">
        <PieIcon size={48} className="mb-2 opacity-20" />
        <span className="text-sm">No data available for this period</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={activeData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80} // Slightly smaller for mobile safety
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {activeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default function Dashboard() {
  // Bar Chart States
  const [barData, setBarData] = useState([]);
  const [revenueFilter, setRevenueFilter] = useState('6_months');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [barLoading, setBarLoading] = useState(true);
  const chartContainerRef = useRef(null);

  // --- 1. Helper to Get Current Month Range ---
  const getCurrentMonthRange = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const formatDate = (d) => {
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay)
    };
  };

  // Pie Chart States & Initial Value
  const [pieData, setPieData] = useState([]);
  const [pieLoading, setPieLoading] = useState(true);
  const [showPieFilter, setShowPieFilter] = useState(false);
  const [pieDateRange, setPieDateRange] = useState(getCurrentMonthRange());
  const { showAlert } = useAlert();

  // Ensure a usable API base URL in the client: trim whitespace and fallback to window.origin
  const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').toString();
  const trimmedApiUrl = rawApiUrl.trim();
  const API_BASE = trimmedApiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  // Helper to build absolute API URLs safely (avoids doubleslashes)
  const buildApiUrl = (path) => {
    if (!API_BASE) return path; // last-resort: return as-is (may be relative)
    return API_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  };

  // Ensure the url is a valid absolute URL. If it's relative, make it absolute using window.location.origin.
  const ensureAbsoluteUrl = (url) => {
    try {
      // If this succeeds, url is absolute and valid
      // eslint-disable-next-line no-new
      new URL(url);
      return url;
    } catch (e) {
      if (typeof window !== 'undefined') {
        // If url already starts with '/', append to origin
        if (url.startsWith('/')) return window.location.origin.replace(/\/$/, '') + url;
        // Otherwise try to append '/' + url
        return window.location.origin.replace(/\/$/, '') + '/' + url.replace(/^\/+/, '');
      }
      return url; // give up; axios may still handle relative
    }
  };

  // --- Fetch Pie Data (Status Counts) ---
  useEffect(() => {
    const fetchStatusCounts = async () => {
      setPieLoading(true);
      try {
        // server route is /api/dashboard/jobcard-status
        let url = buildApiUrl('/api/dashboard/jobcard-status');
        
        if (pieDateRange.startDate && pieDateRange.endDate) {
          url += `?startDate=${pieDateRange.startDate}&endDate=${pieDateRange.endDate}`;
        }
  
        // Helpful debugging: log and normalize the exact URL being requested
        const finalUrl = ensureAbsoluteUrl(url);
        console.log('Fetching jobcard status from:', finalUrl);

        const response = await axios.get(finalUrl);

        if (response && response.data && response.data.success) {
          const { pending, completed, closed } = response.data.data;
          setPieData([
            { name: 'Pending', value: pending || 0 },
            { name: 'Completed', value: completed || 0 },
            { name: 'Closed', value: closed || 0 },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch job status counts:", error);
        setPieData([]); 
      } finally {
        setPieLoading(false);
      }
    };

    fetchStatusCounts();
  }, [pieDateRange.startDate, pieDateRange.endDate, API_BASE]); 

  // --- Fetch Bar Data (Revenue) ---
  useEffect(() => {
    const fetchRevenue = async () => {
      setBarLoading(true);
      try {
        const revenueUrl = buildApiUrl(`/api/dashboard/monthly-revenue?filter=${encodeURIComponent(revenueFilter)}`);
        const finalRevenueUrl = ensureAbsoluteUrl(revenueUrl);
        console.log('Fetching monthly revenue from:', finalRevenueUrl);
        // Increase timeout to handle slower responses in dev/production
        const response = await axios.get(finalRevenueUrl, { timeout: 20000 });
        if (response && response.data && response.data.success) {
          setBarData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch monthly revenue:", error);
        if (error && error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } finally {
        setBarLoading(false);
      }
    };
    fetchRevenue();
  }, [revenueFilter, API_BASE]);

  // --- Handlers ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePieFilterApply = () => {
    if (pieDateRange.startDate && pieDateRange.endDate) {
        setShowPieFilter(false); 
    } else {
        showAlert("Please select both Start and End dates.", "warning");
    }
  };

  const handleClearPieFilter = () => {
      setPieDateRange({ startDate: '', endDate: '' });
      setShowPieFilter(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <main className="flex-1 flex flex-col p-3 sm:p-6 container mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard</h1>
        
        {/* --- Top Button Grid (Responsive) --- */}
        {/* <div className="flex flex-wrap gap-6 p-6"></div>   */}
        {/* <div className="flex flex-wrap sm:flex-wrap lg:flex-wrap gap-3 sm:gap-6 mb-8 p-6"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8 p-6">

          <DashboardCard title="New JobCard" href="/Cards/layout" colorClassName="from-blue-200 to-cyan-200" />
          <DashboardCard title="JobCard List" href="/JobCardList/layout" colorClassName="from-green-200 to-lime-200" />
          <DashboardCard title="New Washing" href="/Washing/layout" colorClassName="from-yellow-200 to-amber-200" />
          <DashboardCard title="Washing List" href="/JobWashingList/layout" colorClassName="from-orange-200 to-red-200" />
          <DashboardCard title="Reports" href="/reports/layout" colorClassName="from-purple-200 to-violet-200" />
          <DashboardCard title="Stock" href="/stock/layout" colorClassName="from-pink-200 to-rose-200" />
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* --- BAR CHART CARD --- */}
          <div 
            ref={chartContainerRef} 
            className={`bg-white rounded-lg shadow-lg flex flex-col transition-all duration-300 ${isFullscreen ? 'p-4 sm:p-10' : 'p-4 sm:p-6'}`}
            style={isFullscreen ? { overflow: 'auto', backgroundColor: 'white' } : {}}
          >
            {/* Header: Wraps on small screens */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Monthly Revenue</h2>
              
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <select 
                    value={revenueFilter} 
                    onChange={(e) => setRevenueFilter(e.target.value)}
                    className="w-full sm:w-auto pl-8 pr-8 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none cursor-pointer appearance-none"
                  >
                    <option value="6_months">Last 6 Months</option>
                    <option value="this_year">This Year ({new Date().getFullYear()})</option>
                    <option value="last_year">Last Year ({new Date().getFullYear() - 1})</option>
                  </select>
                </div>
                
                <button onClick={toggleFullscreen} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-full flex-shrink-0">
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>

            {/* Chart Area: Adaptive Height */}
            <div className={`w-full ${isFullscreen ? 'h-[70vh] sm:h-[85vh]' : 'h-[250px] sm:h-[300px]'}`}>
              {barLoading ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                    Loading revenue...
                </div>
              ) : barData.length > 0 ? (
                <StaticBarChart data={barData} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No revenue data available.</div>
              )}
            </div>
          </div>

          {/* --- PIE CHART CARD --- */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Job Card Status</h2>
                
                <button 
                    onClick={() => setShowPieFilter(!showPieFilter)}
                    className={`p-2 rounded-full transition-colors ${showPieFilter ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    title="Filter by Date"
                >
                    <Calendar size={18} />
                </button>
            </div>

            {/* Date Range Inputs Popup - Responsive Positioning */}
            {showPieFilter && (
                <div className="absolute top-14 right-2 left-2 sm:left-auto sm:right-6 z-20 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-auto  sm:w-72 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-700">Select Range</span>
                        <button onClick={() => setShowPieFilter(false)}><X size={16} className="text-gray-400 hover:text-red-500"/></button>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From:</label>
                            <input 
                                type="date" 
                                value={pieDateRange.startDate}
                                onChange={(e) => setPieDateRange({...pieDateRange, startDate: e.target.value})}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To:</label>
                            <input 
                                type="date" 
                                value={pieDateRange.endDate}
                                onChange={(e) => setPieDateRange({...pieDateRange, endDate: e.target.value})}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={handlePieFilterApply}
                                className="flex-1 bg-blue-600 text-white text-xs sm:text-sm py-1.5 rounded hover:bg-blue-700 transition-colors"
                            >
                                Apply
                            </button>
                            <button 
                                onClick={handleClearPieFilter}
                                className="flex-1 bg-gray-100 text-gray-600 text-xs sm:text-sm py-1.5 rounded hover:bg-gray-200 transition-colors"
                            >
                                All Time
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {pieLoading ? (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-500 text-sm">Loading stats...</div>
            ) : (
              <>
                <StaticPieChart data={pieData} />
                
                {/* Indicator text */}
                <div className="text-center mt-[-10px] min-h-[20px]">
                    {(pieDateRange.startDate && pieDateRange.endDate) ? (
                        <div className="text-xs text-blue-600 font-medium break-words px-2">
                            {pieDateRange.startDate} <span className="text-gray-400">to</span> {pieDateRange.endDate}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 font-medium">
                            Showing: All Time Data
                        </div>
                    )}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
      <div>
        <Footer />
      </div>
    </div>
  );
}