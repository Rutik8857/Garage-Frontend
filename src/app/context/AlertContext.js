'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const AlertContext = createContext(null);

/* ========= ICONS ========= */
const AlertIcon = ({ type }) => {
  if (type === 'error') return <span>❌</span>;
  if (type === 'success') return <span>✅</span>;
  if (type === 'warning') return <span>⚠️</span>;
  return <span>ℹ️</span>;
};

/* ========= PROVIDER ========= */
export function AlertProvider({ children }) {
  /* ----- Toast Alert ----- */
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'info',
  });

  /* ----- Confirm Toast ----- */
  const [confirm, setConfirm] = useState({
    isOpen: false,
    message: '',
  });

  const confirmResolveRef = useRef(null);

  /* ===== SHOW TOAST ===== */
  const showAlert = useCallback((message, type = 'info') => {
    setAlert({ isOpen: true, message, type });

    setTimeout(() => {
      setAlert({ isOpen: false, message: '', type: 'info' });
    }, 3000);
  }, []);

  /* ===== SHOW CONFIRM (Promise based) ===== */
  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirm({ isOpen: true, message });
    });
  }, []);

  const handleConfirm = (result) => {
    setConfirm({ isOpen: false, message: '' });
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* ================= TOAST ALERT ================= */}
      {alert.isOpen && (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
          <div
            className={`flex gap-3 items-start rounded-lg px-4 py-3 shadow-lg min-w-[280px]
              ${alert.type === 'error' && 'bg-red-50 text-red-700 border border-red-200'}
              ${alert.type === 'success' && 'bg-green-50 text-green-700 border border-green-200'}
              ${alert.type === 'info' && 'bg-blue-50 text-blue-700 border border-blue-200'}
            `}
          >
            <AlertIcon type={alert.type} />
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        </div>
      )}

      {/* ================= CONFIRM TOAST ================= */}
      {confirm.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex gap-3 items-start">
              <span className="text-red-600 text-xl">⚠️</span>
              <p className="text-sm font-medium text-gray-800">
                {confirm.message}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => handleConfirm(false)}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

/* ========= HOOK ========= */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
