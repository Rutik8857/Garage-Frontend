





"use client";



import React, { useState, useEffect } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {

  ChevronDown,

  Briefcase,

  WashingMachine,

  Boxes,

  Car,

  Users,

  BarChart3,

  BookCopy,

  FileText,

  UserCog,

  MessageSquareQuote,

  LogOut,

  Search,

  Menu,

  X,

} from "lucide-react";



// --- (menuItems, ProfileIcon, Profile components remain exactly the same) ---

const menuItems = [

  {

    label: "Job Cards",

    icon: Briefcase,

    href: "/jobcard",

    submenu: [

      { label: "Create New Job Card", href: "/Cards/layout" },

      { label: "View All Job Cards", href: "/JobCardList/layout" },

    ],

  },

  {

    label: "Washing JobCard",

    icon: WashingMachine,

    href: "/Washing",

    submenu: [

      { label: "Create Washing Card", href: "/Washing/layout" },

      { label: "View Washing Cards", href: "/JobWashingList/layout" },

    ],

  },

  {

    label: "Washing Card Service",

    icon: WashingMachine,

    href: "/Washing",

    submenu: [

      { label: "New Card", href: "/WashingServiceNewCard/layout" },

      { label: "Washing Cards", href: "/WashingServicesCards/layout" },

    ],

  },

  {

    label: "Jobs/Spares/Oils Stock",

    icon: Boxes,

    href: "/stock/layout",

    isNew: true,

  },

  {

    label: "Make, Model, Variant",

    icon: Car,

    href: "/M_M_V/layout",

  },

  {

    label: "Customers",

    icon: Users,

    href: "/Customers/layout",

  },

  {

    label: "Reports & Search",

    icon: BarChart3,

    href: "/reports/layout",

  },

  {

    label: "Balance Sheet (Ledger)",

    icon: BookCopy,

    href: "/Balance_sheet/layout",

  },

  {

    label: "Quotations",

    icon: FileText,

    href: "/Quatation/layout",

  },

  {

    label: "Staff Management",

    icon: UserCog,

    href: "/employee",

    submenu: [

      { label: "Add New Employee", href: "/StaffManageNewEmp/layout" },

      { label: "Employees List", href: "/StaffManageEmp/layout" },

    ],

  },

  {

    label: "SMS Marketing",

    icon: MessageSquareQuote,

    href: "/SMS/layout",

    isNew: true,

    submenu: [

      { label: "Send SMS", href: "/SMS/layout" },

      { label: "SMS List", href: "/SendSMS/layout" },

    ],

  },

];



const ProfileIcon = () => (

  <img

    src="/miracle_logo.png"

    alt="Company Logo"

    className="w-12 h-12 object-contain"

  />

);



const Profile = () => (

  <img

    src="/profile-logo.jpg"

    alt="User Profile"

    className="w-10 h-10 rounded-full object-cover"

  />

);

// --- (End of unchanged components) ---



export default function Sidebar() {

  const pathname = usePathname();



  // Initialize visible by default

  const [isOpen, setIsOpen] = useState(true);

 

  // 1. ADD STATE FOR EMPLOYEE NAME

  // Default is empty or "Loading..." so it doesn't flash "Administrator" first

  const [employeeName, setEmployeeName] = useState("");



  // Responsive Logic

  useEffect(() => {

    const handleResize = () => {

      if (window.innerWidth < 768) {

        setIsOpen(false);

      } else {

        setIsOpen(true);

      }

    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);



  // 2. FETCH EMPLOYEE NAME FROM LOCAL STORAGE

  useEffect(() => {

    if (typeof window !== "undefined") {

      try {

        // Retrieve data. Ensure 'user' matches what you set in your Login page.

        const storedData = localStorage.getItem("user");

       

        if (storedData) {

          const userObj = JSON.parse(storedData);

         

          // Try to find the name property

          const name = userObj.name || userObj.username || userObj.employeeName || "Employee";

          setEmployeeName(name);

        } else {

          setEmployeeName("Guest");

        }

      } catch (error) {

        console.error("Error parsing user data:", error);

        setEmployeeName("Employee");

      }

    }

  }, []);



  const [openSubmenu, setOpenSubmenu] = useState(() => {

    const activeParent = menuItems.find((item) =>

      item.submenu?.some((subItem) => subItem.href === pathname)

    );

    return activeParent ? activeParent.label : null;

  });



  const [searchTerm, setSearchTerm] = useState("");



  const handleSubmenuToggle = (label) => {

    setOpenSubmenu(openSubmenu === label ? null : label);

  };



  const isParentActive = (item) => {

    if (!item.href) return false;

    return pathname.startsWith(item.href);

  };



  return (

    <>

      {/* 0. MOBILE OVERLAY BACKDROP */}

      {isOpen && (

        <div

          onClick={() => setIsOpen(false)}

          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"

        />

      )}



      {/* 1. OPEN TRIGGER */}

      <button

        onClick={() => setIsOpen(true)}

        className={`fixed top-3 left-4 z-50 p-2 text-white bg-gray-800 rounded-md shadow-lg hover:bg-gray-700 transition-all duration-300 ${

          isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"

        }`}

        aria-label="Open Sidebar"

      >

        <Menu className="w-6 h-6" />

      </button>



      {/* 2. SIDEBAR CONTAINER */}

      <aside

        className={`

          h-screen bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] text-white

          fixed md:sticky top-0 left-0 z-40

          transition-all duration-300 ease-in-out

          flex flex-col overflow-hidden shrink-0 shadow-xl

          ${isOpen ? "w-64" : "w-0"}

        `}

      >

        <div className="w-64 flex flex-col h-full">

         

          {/* HEADER ROW */}

          <div className="flex items-center justify-between p-4 border-b border-gray-700">

            <div className="flex items-center gap-3">

              <ProfileIcon />

              <h1 className="text-xl font-bold whitespace-nowrap">Admin Panel</h1>

            </div>



            <button

              onClick={() => setIsOpen(false)}

              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"

              aria-label="Close Sidebar"

            >

              <X className="w-5 h-5" />

            </button>

          </div>



          {/* 3. PROFILE SECTION (UPDATED) */}

          <div className="flex items-center p-4 gap-4 border-b border-gray-700">

            <Profile />

            <div className="whitespace-nowrap overflow-hidden">

              {/* Main Title stays static */}

              <h3 className="font-semibold">Shri Garage</h3>

             

              {/* Subtitle is now the dynamic Employee Name */}

              <p className="text-sm text-gray-300 capitalize">

                {employeeName || "Administrator"}

              </p>

            </div>

          </div>



          {/* Scrollable Content */}

          <div className="flex-1 flex flex-col overflow-y-auto">

            <div className="p-4">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input

                  type="search"

                  name="search"

                  placeholder={"Search..."}

                  className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                />

              </div>

            </div>



            {/* Navigation */}

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-bg-gray-800 scrollbar-track-gray-900 pb-20">

              {menuItems.map((item) => {

                const term = searchTerm.toLowerCase();

                const parentMatches = item.label.toLowerCase().includes(term);

                const childMatches =

                  item.submenu?.some((subItem) =>

                    subItem.label.toLowerCase().includes(term)

                  ) ?? false;



                const isVisible =

                  searchTerm === "" || parentMatches || childMatches;



                return (

                  <div

                    key={item.label}

                    className={`transition-all duration-300 ease-in-out overflow-hidden ${

                      isVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"

                    }`}

                  >

                    <Link

                      href={item.submenu ? "#" : item.href}

                      onClick={

                        item.submenu

                          ? () => handleSubmenuToggle(item.label)

                          : undefined

                      }

                      className={`flex w-full items-center p-3 rounded-md transition-colors duration-200 whitespace-nowrap ${

                        isParentActive(item)

                          ? "bg-sky-500/20 text-white"

                          : "text-gray-300 hover:bg-gray-800 hover:text-white"

                      }`}

                    >

                      <item.icon className="w-5 h-5 mr-3 shrink-0" />

                      <span className="flex-1">{item.label}</span>

                      {item.isNew && (

                        <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">

                          New

                        </span>

                      )}

                      {item.submenu && (

                        <ChevronDown

                          className={`w-4 h-4 ml-auto shrink-0 transition-transform duration-300 ${

                            openSubmenu === item.label ||

                            (searchTerm && childMatches)

                              ? "rotate-180"

                              : ""

                          }`}

                        />

                      )}

                    </Link>



                    {item.submenu && (

                      <div

                        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${

                          openSubmenu === item.label ||

                          (searchTerm && childMatches)

                            ? "grid-rows-[1fr] opacity-100"

                            : "grid-rows-[0fr] opacity-0"

                        }`}

                      >

                        <div className="overflow-hidden">

                          <ul className="pl-8 py-1 space-y-1">

                            {item.submenu.map((subItem) => (

                              <li key={subItem.label}>

                                <Link

                                  href={subItem.href}

                                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap ${

                                    pathname === subItem.href

                                      ? "text-sky-400"

                                      : "text-gray-400 hover:text-white"

                                  }`}

                                >

                                  <span className="w-1.5 h-1.5 mr-3 bg-gray-500 rounded-full"></span>

                                  {subItem.label}

                                </Link>

                              </li>

                            ))}

                          </ul>

                        </div>

                      </div>

                    )}

                  </div>

                );

              })}

            </nav>



            {/* Footer */}

            <div className="p-4 border-t border-gray-700">

              <Link

                href="/Login"

                className="flex w-full items-center p-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors duration-200 whitespace-nowrap"

              >

                <LogOut className="w-5 h-5 mr-3" />

                Logout

              </Link>

            </div>

          </div>

        </div>

      </aside>

    </>

  );

}