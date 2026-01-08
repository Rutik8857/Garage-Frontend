"use client";

import React from 'react';

const FormField = ({ label, type = 'text', name, value, onChange, required = false, disabled = false, children, ...props }) => {
    const InputComponent = type === 'select' ? 'select' : 'input';

    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1.5 text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <InputComponent
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                {...props}
                className={`w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
                {children}
            </InputComponent>
        </div>
    );
};

export default FormField;
