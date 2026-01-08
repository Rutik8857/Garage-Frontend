"use client";

import { useState } from 'react';
import Axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAlert } from '../context/AlertContext';

export default function ForgotPasswordPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send request to backend
      const response = await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, { email });

      // If response status is 200: Show success toast
      if (response.status === 200 && response.data.success) {
        showAlert('Password reset link sent to your registered email', 'success');
        // Redirect to login after a short delay so the user can read the message
        setTimeout(() => {
          router.push('/Login');
        }, 3000);
      }
    } catch (error) {
      // If response status is 404: Show error toast
      if (error.response?.status === 404) {
        showAlert('This email is not registered', 'error');
      } else {
        const errMsg = error.response?.data?.message || 'Request failed. Please try again.';
        showAlert(errMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        
        {/* Header (Blue Bar) */}
        <div className="bg-blue-600 h-2 w-full"></div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
            Reset Password
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Enter your email to receive a reset link
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="john@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors font-medium disabled:opacity-70"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/Login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}