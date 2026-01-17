"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
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
  User, // Imported generic User icon for fallback
} from "lucide-react";
import { useAlert } from '../context/AlertContext';
import { useConfirm } from '../context/ConfirmContext';




const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

// --- Menu Items (Same as before) ---
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

// --- UPDATED PROFILE COMPONENT ---
const Profile = ({ userImage }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If no image is provided from DB, stop here (will show fallback icon)
    // default to server-hosted default image when no userImage
    if (!userImage) {
      setImgSrc(null);
      setHasError(false);
      return;
    }

    // 1. Logic to fix path string coming from DB
    let cleanPath = userImage;

    // FIX: If the DB value is the default logo, serve it locally from frontend
    // This prevents requesting it from the backend and causing ORB/404 errors
    if (cleanPath.includes("profile-logo.jpg")) {
      setImgSrc("/profile-logo.jpg");
      setHasError(false);
      return;
    }

    // 1. Normalize slashes first (handle Windows paths from DB)
    cleanPath = cleanPath.replace(/\\/g, "/");

    // 2. Remove "public" folder if present at the start (e.g. "public/uploads/..." or "/public/...")
    cleanPath = cleanPath.replace(/^\/?public\//, "");

    // Remove leading slash to ensure clean join
    cleanPath = cleanPath.replace(/^\//, "");

    // 2. Construct final URL
    // If the image is a full URL (Google/Facebook), use it as is.
    // Otherwise, append to API_BASE.
    const finalUrl = cleanPath.startsWith("http")
      ? cleanPath
      : `${API_BASE}/${cleanPath}`;

    setImgSrc(finalUrl);
    setHasError(false); // Reset error state on new image
  }, [userImage]);

  // If we have a valid source and no error, show the image
  if (imgSrc && !hasError) {
    return (
      <img
        src={imgSrc}
        alt="User Profile"
        onError={() => setHasError(true)}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 bg-gray-800"
      />
    );
  }

  // Fallback: Generic User Icon (Not the Miracle Logo)
  return (
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
      <User className="w-6 h-6 text-gray-400" />
    </div>
  );
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const [isOpen, setIsOpen] = useState(true);

  // User Data State
  const [employeeName, setEmployeeName] = useState("");
  const [userImage, setUserImage] = useState(null);

  // Responsive Logic
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- FETCH USER FROM DB ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (typeof window === "undefined") return;

      try {
        const stored = localStorage.getItem("user");
        if (!stored) {
          setEmployeeName("Guest");
          return;
        }

        const u = JSON.parse(stored);

        // 1. Set immediate data from Local Storage (prevent flickering)
        setEmployeeName(u.name || u.username || u.employeeName || "Employee");
        if (u.profile_image) setUserImage(u.profile_image);

        // 2. Fetch fresh data from API using the ID
        if (u.id) {
          const resp = await fetch(`${API_BASE}/api/users/${u.id}`);
          if (resp.ok) {
            const json = await resp.json();

            // support both legacy and new response shapes
            const payload = json && json.data ? json.data : json;

            // Update name if changed
            const freshName =
              payload.name || payload.username || payload.employeeName;
            if (freshName) setEmployeeName(freshName);

            // Update Image - Get raw path from DB (support both naming conventions)
            const imageUrl = payload?.profile_image || payload?.profileImage || null;
            setUserImage(imageUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserData();
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


   const handleLogout = () => {
    confirm('Are you sure you want to logout?', () => {
      // Clear user data from both storages to be safe
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      showAlert('Logged out successfully', 'success');
      // Redirect to login page
      router.push('/login');
    });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
        />
      )}

      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-3 left-4 z-50 p-2 text-white bg-gray-800 rounded-md shadow-lg hover:bg-gray-700 transition-all duration-300 ${
          isOpen
            ? "opacity-0 pointer-events-none scale-75"
            : "opacity-100 scale-100"
        }`}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* SIDEBAR */}
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
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <ProfileIcon />
              <h1 className="text-xl font-bold whitespace-nowrap">
                Admin Panel
              </h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PROFILE SECTION */}
          <div className="flex items-center p-4 gap-4 border-b border-gray-700">
            {/* The Profile component now strictly uses the DB image */}
            <Profile userImage={userImage} />
            <div className="whitespace-nowrap overflow-hidden">
              <h3 className="font-semibold">Shri Garage</h3>
              <p className="text-sm text-gray-300 capitalize">
                {employeeName || "Administrator"}
              </p>
            </div>
          </div>

          {/* SEARCH & MENU */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-thin pb-20">
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
                    className={`transition-all duration-300 overflow-hidden ${
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
                      className={`flex w-full items-center p-3 rounded-md transition-colors ${
                        isParentActive(item)
                          ? "bg-sky-500/20 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.isNew && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                      {item.submenu && (
                        <ChevronDown
                          className={`w-4 h-4 ml-auto transition-transform ${
                            openSubmenu === item.label ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Link>

                    {item.submenu && (
                      <div
                        className={`grid overflow-hidden transition-all duration-300 ${
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
                                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
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

            <div className="p-4 border-t border-gray-700">
              <button onClick={handleLogout}
                className="flex w-full items-center p-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
