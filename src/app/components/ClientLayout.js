'use client';

import { AlertProvider } from '../context/AlertContext';
import { ConfirmProvider } from '../context/ConfirmContext';
import AuthGuard from '../AuthGuard';

export default function ClientLayout({ children }) {
  return (
    <AlertProvider>
      <ConfirmProvider>
        <AuthGuard>{children}</AuthGuard>
      </ConfirmProvider>
    </AlertProvider>
  );
}
