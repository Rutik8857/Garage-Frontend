// 'use client';

// import { createContext, useContext, useState, useCallback } from 'react';

// const AlertContext = createContext(null);

// export function AlertProvider({ children }) {
//   const [alert, setAlert] = useState({ isOpen: false, message: '' });

//   const showAlert = useCallback((message) => {
//     setAlert({ isOpen: true, message });
//   }, []);

//   const closeAlert = useCallback(() => {
//     setAlert({ isOpen: false, message: '' });
//   }, []);

//   return (
//     <AlertContext.Provider value={{ showAlert }}>
//       {children}
//       {alert.isOpen && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
//             <p className="text-gray-800 text-base mb-6 whitespace-pre-wrap">{alert.message}</p>
//             <div className="flex justify-end">
//               <button
//                 onClick={closeAlert}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//               >
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AlertContext.Provider>
//   );
// }

// export function useAlert() {
//   const context = useContext(AlertContext);
//   if (!context) {
//     throw new Error('useAlert must be used within an AlertProvider');
//   }
//   return context;
// }




// 'use client';

// import { createContext, useContext, useState, useCallback, useRef } from 'react';

// const AlertContext = createContext(null);

// // Icons for different alert types
// const AlertIcon = ({ type }) => {
//   if (type === 'error') return <span>❌</span>;
//   if (type === 'success') return <span>✅</span>;
//   return <span>ℹ️</span>;
// };

// export function AlertProvider({ children }) {
//   const [alert, setAlert] = useState({
//     isOpen: false,
//     message: '',
//     type: 'info',
//   });

//   const [confirm, setConfirm] = useState({
//     isOpen: false,
//     message: '',
//     title: '',
//   });

//   const confirmResolveRef = useRef(null);

//   const showAlert = useCallback((message, type = 'info') => {
//     setAlert({ isOpen: true, message, type });
//     setTimeout(() => {
//       setAlert({ isOpen: false, message: '', type: 'info' });
//     }, 3000);
//   }, []);

//   // Promise-based confirm dialog
//   const showConfirm = useCallback((message, title = 'Confirm') => {
//     return new Promise((resolve) => {
//       confirmResolveRef.current = resolve;
//       setConfirm({ isOpen: true, message, title });
//     });
//   }, []);

//   const handleConfirm = (result) => {
//     setConfirm({ isOpen: false, message: '', title: '' });
//     if (confirmResolveRef.current) {
//       confirmResolveRef.current(result);
//       confirmResolveRef.current = null;
//     }
//   };

//   return (
//     <AlertContext.Provider value={{ showAlert, showConfirm }}>
//       {children}

//       {/* Toast Notification */}
//       {alert.isOpen && (
//         <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
//           <div
//             className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[280px] max-w-[400px]
//               ${alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
//               ${alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
//               ${alert.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
//             `}
//           >
//             <span className="mt-0.5 flex-shrink-0">
//               <AlertIcon type={alert.type} />
//             </span>
//             <p className="text-sm font-medium">{alert.message}</p>
//           </div>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       {confirm.isOpen && (
//         <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirm.title}</h3>
//             <p className="text-gray-600 text-sm mb-6">{confirm.message}</p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => handleConfirm(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleConfirm(true)}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AlertContext.Provider>
//   );
// }

// export function useAlert() {
//   const context = useContext(AlertContext);
//   if (!context) {
//     throw new Error('useAlert must be used within an AlertProvider');
//   }
//   return context;
// }




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
        // <div className="fixed inset-0  z-[10000] animate-slide-in">
        //   <div className="bg-white border border-red-200 shadow-lg rounded-lg p-4 w-[320px]">
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
