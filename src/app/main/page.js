'use client'
import React, { useState } from 'react'
import Header from '../components/Header'
import Dashboard from '../components/DashboardButtons'
import Sidebar from '../components/Sidebar'
import { useEffect } from 'react'


function MainDash() {




  return (
         <div className="flex flex-col w-full min-h-screen bg-slate-100">

        <Header />
        <Dashboard />
    </div>
  )
}

export default MainDash
