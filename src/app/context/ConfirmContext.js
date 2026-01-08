"use client";
import React, { createContext, useContext, useState } from 'react';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const showConfirm = (message, onConfirm, onCancel) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm,
      onCancel,
    });
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (confirmState.onConfirm) confirmState.onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (confirmState.onCancel) confirmState.onCancel();
    closeConfirm();
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmState.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};