"use client";

import { useState } from 'react';
import Axios from 'axios';
import Link from 'next/link';
import { useAlert } from '../context/AlertContext';
import { useFormValidation, FieldError } from '../hooks/useFormValidation';

export default function LoginPage() {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { errors, validate, clearErrors, getFieldClass } = useFormValidation({
    email: { required: true, message: 'Email is required' },
    password: { required: true, message: 'Password is required' },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate(formData)) {
      showAlert('Please fill all required fields', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, formData);

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        clearErrors();
        showAlert('Login Successful!', 'success');
        window.location.href = '/'; 
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Invalid email or password.';
      showAlert(`Login Failed: ${errMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={getFieldClass('email', 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm')}
                placeholder="john@example.com"
                onChange={handleChange}
              />
              <FieldError error={errors.email} />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={getFieldClass('password', 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm')}
                placeholder="••••••••"
                onChange={handleChange}
              />
              <FieldError error={errors.password} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="ForgotPassword" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}