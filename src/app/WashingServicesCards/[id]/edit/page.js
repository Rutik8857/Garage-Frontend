"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useAlert } from "../../../context/AlertContext";

export default function JobEditPage() {
  const { showAlert } = useAlert();
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState({
    vehicle_no: "",
    make: "",
    model: "",
    customer_name: "",
    mobile_number: "",
    delivery_date: "",
    delivery_time: "",
    mechanic: "",
    labour_charges: "",
    advance_amount: "",
    bill_amount: "",
    completion_date: "",
    completion_time: "",
    exit_date: "",
    exit_time: "",
    reminder_month: "",
  });

  useEffect(() => {
    // prefill from query params (from previous step)
    if (search) {
      const entries = Object.fromEntries(search.entries());
      setForm((f) => ({ ...f, ...entries }));
    }
    // also fetch existing job to fill remaining fields
    const fetchJob = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/washing-jobs/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) setForm((f) => ({ ...f, ...data.data }));
      } catch (err) {
        // ignore
      }
    };
    if (id) fetchJob();
  }, [id, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    router.push(`/WashingServicesCards/${id}/layout`);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/washing-jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      // on success, navigate back to list or show message
      router.push('/WashingServicesCards/layout');
      showAlert('JobCard updated successfully', 'success');
    } catch (err) {
      showAlert(err.message || 'Failed to update', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="flex-grow w-full p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h2 className="text-lg font-semibold text-white">Edit Washing Card</h2>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Date <span className="text-red-500">*</span></label>
                <input type="date" name="delivery_date" value={form.delivery_date || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
                <input type="time" name="delivery_time" value={form.delivery_time || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Mechanic <span className="text-red-500">*</span></label>
                <select name="mechanic" value={form.mechanic || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
                  <option value="">Select mechanic</option>
                  <option value="Shri Garage">Shri Garage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Labour Charges</label>
                <input name="labour_charges" value={form.labour_charges || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
                <input name="advance_amount" value={form.advance_amount || "0"} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bill Amount <span className="text-red-500">*</span></label>
                <input name="bill_amount" value={form.bill_amount || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Completion Date</label>
                <input type="date" name="completion_date" value={form.completion_date || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Completion Time</label>
                <input type="time" name="completion_time" value={form.completion_time || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exit Date</label>
                <input type="date" name="exit_date" value={form.exit_date || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exit Time</label>
                <input type="time" name="exit_time" value={form.exit_time || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Select Reminder Month<span className="text-red-500">*</span></label>
                <select name="reminder_month" value={form.reminder_month || ""} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
                  <option value="">Select</option>
                  <option value="1">1 Month</option>
                  <option value="2">2 Month</option>
                  <option value="3">3 Month</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={handlePrevious} className="px-4 py-2 border rounded">Previous</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update JobCard</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
