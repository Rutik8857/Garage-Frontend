


'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  LogOut,
  Bell,
  UserCircle,
  ChevronLeft,
  PlusCircle,
  Calendar,
  Clock,
  WashingMachine,
  Car,
  Users
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        try {
          const user = JSON.parse(storedData);
          setUserName(user.name || user.username || "Admin");
        } catch (e) { console.error(e); }
      }
    }
  }, []);

  useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate ? currentDate.toLocaleDateString('en-GB', { 
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
  }) : "...";

  const formattedTime = currentDate ? currentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
  }) : "--:--";

  // --- SAFE LOGOUT HANDLER ---
  const handleLogout = () => {
    // Clear user data from both storages to be safe
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // Redirect to login page
    router.push('/login');
  };

  // --- REUSABLE COMPONENT FOR THE HOVER EFFECT ---
  // This ensures consistent behavior: Icon visible, Text expands on hover
  const HeaderLink = ({ href, icon: Icon, label, colorClass = "text-gray-200" }) => (
    <Link
      href={href}
          className="group flex items-center justify-center  hover:bg-white/50 text-white hover:text-black p-2 rounded-full shadow-md   active:scale-95"
      title={label}
    >
      {/* Icon always visible */}
      <Icon size={20} className="shrink-0" />
      
      {/* Text hidden (width 0) by default, expands on hover */}
      <span className="
      max-w-0 overflow-hidden opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:pl-2  whitespace-nowrap text-sm font-medium
       
      ">
        {label}
      </span>
    </Link>
  );

  return (
    // Changed z-40 to z-30 to ensure Sidebar (z-40/50) overlays correctly on mobile
    <header className="sticky top-0 z-30 w-full h-16 bg-gradient-to-r from-[#1e3d4a] via-[#203a43] to-[#2c5364] text-white shadow-lg flex items-center justify-between px-3 sm:px-6 transition-all duration-300">
      
      {/* --- LEFT SECTION --- */}
      <div className="flex items-center gap-2 sm:gap-3 ml-12 md:ml-0 transition-all duration-300">
        <button 
          onClick={() => router.back()} 
          className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all"
          title="Go Back"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="h-5 w-px bg-white/20 hidden sm:block mx-1"></div>

        {/* 1. Dashboard (Standard) */}
        <HeaderLink href="../../../" icon={LayoutDashboard} label="Dashboard" />

        {/* 2. NEW ITEMS (Added here) */}
        {/* Hidden on mobile to prevent overcrowding, visible on large screens */}
        <div className="hidden xl:flex items-center gap-2 border-l border-white/10 pl-3 ml-1">
            <HeaderLink href="/Washing/layout" icon={WashingMachine} label="Washing" colorClass="text-cyan-300" />
            <HeaderLink href="/M_M_V/layout" icon={Car} label="Make/Model" colorClass="text-orange-300" />
            <HeaderLink href="/Customers/layout" icon={Users} label="Customers" colorClass="text-green-300" />
        </div>
      </div>

      {/* --- CENTER SECTION (Date/Time) --- */}
      <div className="hidden lg:flex items-center gap-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
         <div className="flex items-center gap-2 border-r border-white/20 pr-4">
            <Calendar size={15} className="text-cyan-400" />
            <span className="text-[10px] font-medium tracking-wide text-gray-200 uppercase whitespace-nowrap">
                {formattedDate}
            </span>
         </div>
         <div className="flex items-center gap-2">
            <Clock size={15} className="text-emerald-400" />
            <span className="text-xs font-bold text-white tabular-nums">
                {formattedTime}
            </span>
         </div>
      </div>

      {/* --- RIGHT SECTION --- */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* New Job Button */}
        {/* Using the same logic as HeaderLink but manually defined for specific coloring/padding if needed */}
        <Link 
          href="/Cards/layout"
          className="group flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-md transition-all duration-300 active:scale-95"
          title="Create New Job"
        >
          <PlusCircle size={20} className="shrink-0" />
          <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:pl-2 transition-all duration-500 ease-out whitespace-nowrap text-sm font-semibold">
            New Job
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 border-l border-white/20 pl-2 sm:pl-4">
            
            {/* Notification Bell */}
            <Link 
                href="/SendSMS/layout" 
                className="relative p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#203a43]"></span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-2 cursor-pointer group relative">
                <div className="text-right hidden lg:block">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Logged In</p>
                    <p className="text-sm font-bold leading-none capitalize max-w-[100px] truncate">{userName}</p>
                </div>
                
                <div className="p-0.5 sm:p-1 bg-white/10 rounded-full border border-white/20">
                    <UserCircle size={22} className="text-cyan-400 sm:w-6 sm:h-6" />
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-10 w-32 bg-white text-gray-800 rounded-md shadow-xl py-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right z-50">
                    <div className="px-4 py-2 border-b lg:hidden">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold truncate text-gray-800">{userName}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600">
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </div>
        </div>

      </div>
    </header>
  );
}