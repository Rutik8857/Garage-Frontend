"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

//   const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [job, setJob] = useState({
  make: "",
   model: "",
});



  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/washing-jobs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        if (data.success) setJob(data.data);
        else throw new Error(data.message || "No data");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const handleNext = (e) => {
    e.preventDefault();
    // pass current job fields as query params to edit step
    const qs = new URLSearchParams({
      vehicle_no: job?.vehicle_no || "",
      make: job?.make || "",
      model: job?.model || "",
      customer_name: job?.customer_name || "",
      mobile_number: job?.mobile_number || "",
    }).toString();
    router.push(`/WashingServicesCards/${id}/edit?${qs}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!job) return <div className="p-6">No job found.</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">
      <Header />
      <div className="flex-grow w-full p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h2 className="text-lg font-semibold text-white">Edit Washing Card</h2>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleNext}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle No.</label>
                <input type="text" name="vehicle_no" value={job.vehicle_no || ""} readOnly className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Make</label>
                <select name="make" value={job.make || ""}  onChange={(e) =>
                     setJob({ ...job, make: e.target.value })
                         } className="mt-1 block w-full border rounded p-2">
                  <option value="">Select make</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="ford">Ford</option>
                  <option value="maruti">Maruti Suzuki</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <select name="model" value={job.model || ""}   onChange={(e) =>
                       setJob({ ...job, model: e.target.value })
                    } className="mt-1 block w-full border rounded p-2">
                  <option value="">Select model</option>
                  <option value="corolla">Corolla</option>
                  <option value="civic">Civic</option>
                  <option value="ecosport">EcoSport</option>
                  <option value="swift">Swift</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                <input type="text" name="customer_name" defaultValue={job.customer_name || ""} className="mt-1 block w-full border rounded p-2" />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                <input type="tel" name="mobile_number" defaultValue={job.mobile_number || ""} className="mt-1 block w-full border rounded p-2" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="px-6 py-2.5 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700">Next</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
