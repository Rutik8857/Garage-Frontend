


"use client";

// Import useState and FormEvent (FormEvent is removed for JS)
import { useState } from 'react';
// Assuming Footer and Header are in 'app/components/'
// If they are in 'src/components' you might need '@/components/Footer'
import Footer from '../components/Footer';
import Header from '../components/Header';
// import Link from 'next/link';

// --- IMPORTANT ---
// This URL points to your separate Node.js/Express backend.
// You should use an environment variable for this in a real app.
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/sms`;

// Main component for the SMS Marketing page
export default function SmsMarketingPage() {
  // --- State for all form fields ---
  const [sendOption, setSendOption] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('2025-09-29'); // Matches your default
  const [scheduledTime, setScheduledTime] = useState('');
  const [message, setMessage] = useState('');

  // --- State for loading and API feedback ---
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ success: false, message: '' });

  // --- Form submission handler ---
  // Removed TypeScript type "FormEvent<HTMLFormElement>" from "event"
  const handleSubmit = async (event) => {
    event.preventDefault(); // Stop the page from reloading
    setIsLoading(true);
    setFeedback({ success: false, message: '' }); // Clear old feedback

    // 1. Collect all data from state
    const formData = {
      sendOption,
      scheduledDate,
      scheduledTime,
      message,
    };

    try {
      // 2. Send data to your Express backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // 3. Get the JSON response from your controller
      const result = await response.json();

      if (response.ok) {
        // Success! (e.g., 201 status code)
        setFeedback({ success: true, message: result.message });
        // Reset the form after success
        setMessage('');
        setScheduledTime('');
      } else {
        // Error (e.g., 400 or 500 status code)
        setFeedback({ success: false, message: result.message });
      }
    } catch (error) {
      // 4. Handle network errors (e.g., backend is down)
      console.error('Fetch error:', error);
      setFeedback({
        success: false,
        message: 'Could not connect to the server. Please try again.',
      });
    } finally {
      // 5. Stop the loading state
      setIsLoading(false);
    }
  };

  // SVG Icon for the list button (Your code)
  const ListIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h7"
      />
    </svg>
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      {/* <Header /> */}
      <Header />
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="container mx-auto p-4 md:p-8">
          {/* Header Section (Your code) */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">SMS Marketing</h1>
            <nav className="text-sm text-gray-500">
              <a href="#" className="text-blue-600 hover:underline">
                Home
              </a>
              <span className="mx-2">/</span>
              <a href="#" className="text-blue-600 hover:underline">
                SMS List
              </a>
              <span className="mx-2">/</span>
              <span>Send SMS</span>
            </nav>
          </header>

          {/* Main Content Card */}
          <main className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Card Header (Your code) */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Send New SMS</h2>
              {/* Replaced Link with <a> tag */}
              <a
                href="\SendSMS\layout"
                className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <ListIcon />
                SMS List
              </a>
            </div>

            {/* --- MODIFIED: Form Section --- */}
            {/* We added the onSubmit handler here */}
            <form className="p-6 md:p-8 space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Send Options (Your code, no changes needed) */}
                <div className="flex items-center space-x-6">
                  <label className="font-medium text-gray-700">
                    Select Option <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="now"
                        name="sendOption"
                        value="now"
                        checked={sendOption === 'now'}
                        onChange={() => setSendOption('now')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="now"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Now
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="schedule"
                        name="sendOption"
                        value="schedule"
                        checked={sendOption === 'schedule'}
                        onChange={() => setSendOption('schedule')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="schedule"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Schedule
                      </label>
                    </div>
                  </div>
                </div>

                {/* --- MODIFIED: Date and Time Section --- */}
                {/* Inputs are now controlled with value and onChange */}
                <div className="space-y-4">
                  <div className="w-full">
                    <label
                      htmlFor="scheduledDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={scheduledDate} // Use value from state
                      onChange={(e) => setScheduledDate(e.target.value)} // Update state
                      required // Added client-side validation
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  {sendOption === 'schedule' && (
                    <div className="w-full">
                      <label
                        htmlFor="scheduledTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Schedule Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        id="scheduledTime"
                        name="scheduledTime"
                        value={scheduledTime} // Use value from state
                        onChange={(e) => setScheduledTime(e.target.value)} // Update state
                        required={sendOption === 'schedule'} // Conditionally required
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* --- MODIFIED: Message Textarea --- */}
              {/* Input is now controlled with value and onChange */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={message} // Use value from state
                  onChange={(e) => setMessage(e.target.value)} // Update state
                  required // Added client-side validation
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your SMS message here..." // Added placeholder
                ></textarea>
              </div>

              {/* --- NEW: Feedback Area --- */}
              {/* This div will show success or error messages from the backend */}
              {feedback.message && (
                <div
                  className={`p-4 rounded-md text-sm ${
                    feedback.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {/* --- MODIFIED: Send Button --- */}
              {/* Button is disabled and shows "Sending..." while loading */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
      {/* <Footer /> */}
      <Footer />
    </div>
  );
}
