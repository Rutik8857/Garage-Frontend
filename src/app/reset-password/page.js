"use client";

import { useState, useEffect, Suspense } from 'react';
import Axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '../context/AlertContext';

function ResetPasswordForm() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use null to distinguish between "not checked yet" and "missing"
  const [token, setToken] = useState(null); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get('token');
    console.log('[DEBUG] Token from URL:', tokenFromUrl); // For debugging
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // If token is missing, show error
      showAlert('Invalid reset link: Token is missing.', 'error');
      console.error('[DEBUG] Reset token missing from URL parameters.');
      setToken(''); // Set to empty string to signify it's checked and missing
    }
  }, [searchParams, showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('[DEBUG] Submitting with token:', token); // For debugging

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      showAlert('Password must be at least 6 characters long', 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Send request to backend
      const response = await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });

      if (response.status === 200 && response.data.success) {
        showAlert(response.data.message || 'Password has been reset successfully. You can now login with your new password.', 'success');
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/Login');
        }, 2000);
      }
    } catch (error) {
      // Handle error responses from the backend
      const errMsg = error.response?.data?.message || 'Request failed. Please try again.';
      showAlert(errMsg, 'error');
      // By removing the automatic redirect, the user can see the error and the URL they used.
    } finally {
      setIsLoading(false);
    }
  };

  // Show a clear error message if the token is missing from the URL
  if (token === '' || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="w-full max-w-md text-center bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">The password reset link is invalid or missing a token. Please request a new link.</p>
          <Link href="/ForgotPassword" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  // Show a loading state while the token is being read from the URL
  if (token === null && typeof window !== 'undefined') {
    return (
      <div className="flex min-h-screen items-center justify-center">Verifying link...</div>
    );
  }

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
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}










// "use client";

// import { useState, useEffect } from 'react';
// import Axios from 'axios';
// import Link from 'next/link';
// import { useRouter, useParams } from 'next/navigation';
// import { useAlert } from '../context/AlertContext';

// export default function ResetPasswordTokenPage() {
//   const { showAlert } = useAlert();
//   const router = useRouter();
//   const params = useParams(); // Get parameters from the dynamic route
  
//   const [token, setToken] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   useEffect(() => {
//     // Get token from the URL path (e.g., /reset-password/12345)
//     if (params.token) {
//       setToken(params.token);
//     } else {
//       showAlert('Invalid reset link: Token is missing.', 'error');
//       router.push('/ForgotPassword');
//     }
//   }, [params, router, showAlert]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (newPassword !== confirmPassword) {
//       showAlert('Passwords do not match', 'error');
//       setIsLoading(false);
//       return;
//     }

//     if (newPassword.length < 6) {
//       showAlert('Password must be at least 6 characters long', 'error');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await Axios.post('NEXT_PUBLIC_API_URL/api/auth/reset-password', {
//         token,
//         newPassword,
//       });

//       if (response.status === 200 && response.data.success) {
//         showAlert('Password has been reset successfully. Please login.', 'success');
//         setTimeout(() => {
//           router.push('/Login');
//         }, 2000);
//       }
//     } catch (error) {
//       const errMsg = error.response?.data?.message || 'Request failed. Please try again.';
//       showAlert(errMsg, 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
//       <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
//         <div className="bg-blue-600 h-2 w-full"></div>
//         <div className="p-8">
//           <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Reset Password</h2>
//           <p className="text-center text-gray-500 mb-8 text-sm">Enter your new password below</p>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter new password"
//                   required
//                   minLength={6}
//                 />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//                   {showPassword ? '👁️' : '👁️‍🗨️'}
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
//               <div className="relative">
//                 <input
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Confirm new password"
//                   required
//                   minLength={6}
//                 />
//                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//                   {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-70">
//               {isLoading ? 'Resetting...' : 'Reset Password'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }