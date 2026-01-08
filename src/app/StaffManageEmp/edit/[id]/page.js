

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useAlert } from "../../../context/AlertContext";

export default function EditUserPage() {
  const { id } = useParams(); // 👈 dynamic id
  const router = useRouter();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ 1️⃣ Fetch user by ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setFormData({
          name: data.name,
          email: data.email,
          mobile_number: data.mobile_number,
        });
      } catch (err) {
        showAlert("Failed to load user data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ✅ 2️⃣ Handle change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 3️⃣ Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Update failed");

      showAlert("User updated successfully", "success");
      router.push("/StaffManageEmp/layout"); // back to list
    } catch (err) {
      showAlert("Failed to update user", "error");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    // <div className="flex flex-col min-h-screen bg-slate-100">
    <div className="flex flex-col  min-h-screen w-full bg-slate-100">
      <Header />
      {/* <div className="max-w-7xl mx-auto p-4 w-full sm:p-6 lg:p-8"> */}
      <div className="max-w-7xl mx-auto h-full p-4 w-full sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="max-w-7xl  mx-auto  bg-white p-6 rounded-lg shadow mt-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Edit User</h2>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border p-2 mb-3"
          />

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 mb-3"
          />

          <input
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            placeholder="Mobile"
            className="w-full border p-2 mb-3"
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Update User
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
