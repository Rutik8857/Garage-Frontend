"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function CreateJobCardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Prefill from query params if present
  const [form, setForm] = useState({
    vehicle_no: searchParams.get("vehicle_no") || "",
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    customer_name: searchParams.get("customer_name") || "",
    mobile_number: searchParams.get("mobile_number") || "",
    delivery_date: searchParams.get("delivery_date") || "",
    delivery_time: searchParams.get("delivery_time") || "",
    mechanic: "",
    labour_amount: "",
    advance_amount: "0",
    bill_amount: "",
    completion_date: "",
    completion_time: "",
    exit_date: "",
    exit_time: "",
    reminder_month: "",
    free_service: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/washing-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create");
      setSuccess(data.message || "Created successfully");
      // after a short delay go back to list
      setTimeout(() => router.push("/"), 900);
    } catch (err) {
      setError(err.message || String(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="flex-grow w-full p-4 sm:p-6 lg:p-8 bg-slate-100">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h2 className="text-lg font-semibold text-white">Create Job Card</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
                <input type="time" name="delivery_time" value={form.delivery_time} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Mechanic</label>
                <select name="mechanic" value={form.mechanic} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2">
                  <option value="">Select one</option>
                  <option>Shri Garage</option>
                  <option>Mechanic A</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Labour Amount</label>
                <input name="labour_amount" value={form.labour_amount} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
                <input name="advance_amount" value={form.advance_amount} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bill Amount</label>
                <input name="bill_amount" value={form.bill_amount} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Completion Date</label>
                <input  type="date" name="completion_date" value={form.completion_date} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Completion Time</label>
                <input type="time" name="completion_time" value={form.completion_time} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Exit Date</label>
                <input type="date" name="exit_date" value={form.exit_date} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Exit Time</label>
                <input type="time" name="exit_time" value={form.exit_time} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Reminder Month</label>
                <select name="reminder_month" value={form.reminder_month} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2">
                  <option value="">Select one</option>
                  <option>1 Month</option>
                  <option>2 Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Free Services</label>
                <select name="free_service" value={form.free_service} onChange={handleChange} className="mt-1 block w-full rounded border-gray-300 border p-2">
                  <option value="">Select one</option>
                  <option>Service A</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 mt-6">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border">Previous</button>
              <button type="button" onClick={handleCreate} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">
                {loading ? 'Creating...' : 'Create JobCard'}
              </button>
            </div>

            <div className="mt-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
