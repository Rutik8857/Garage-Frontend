"use client";
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white-300 border-t shadow-inner border-gray-200 text-md text-black  py-4 px-10 flex justify-between items-center sm:flex-col flex-col md:flex-col ">
      <div className="text-center">
        Copyright © 2014-2025 <a href="#" className="text-cyan-600 hover:underline">Three Artisan Multiservices</a>. All rights reserved.
      </div>
      <div>
        Version 2.0
      </div>
    </footer>
  );
}
