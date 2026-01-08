"use client";
import React, { useState } from 'react';
import { useAlert } from '../context/AlertContext';

export default function CreateUserForm() {
  const { showAlert } = useAlert();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const API = (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_API_URL || window.location.origin.replace(/:3000$/, ':4000'))) || 'http://localhost:4000';

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const created = await res.json();
      console.log('Created user', created);
      setName('');
      setEmail('');
      // notify other components (UsersListClient) to update without a full reload
      try {
        window.dispatchEvent(new CustomEvent('user:created', { detail: created }));
      } catch (e) {
        // ignore (non-browser env)
      }
    } catch (err) {
      console.error('Create failed', err);
      showAlert('Failed to create user: ' + err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="border px-2 py-1" />
      </div>
      <div className="mb-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="border px-2 py-1" />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Create</button>
    </form>
  );
}
