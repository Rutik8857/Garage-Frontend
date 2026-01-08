'use client';

import { AlertProvider } from '../context/AlertContext';
import AuthGuard from '../AuthGuard';

export default function ClientLayout({ children }) {
  return (
    <AlertProvider>
      <AuthGuard>{children}</AuthGuard>
    </AlertProvider>
  );
}
