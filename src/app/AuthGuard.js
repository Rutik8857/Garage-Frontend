'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Checks for user data in localStorage or sessionStorage.
 * @returns {string|null} The user data string or null if not found.
 */
const checkUser = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user') || sessionStorage.getItem('user');
};

/**
 * A client-side component that protects routes based on authentication status.
 */
export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    // Define public paths that don't require authentication
    const publicPaths = ['/Login', '/ForgotPassword', '/reset-password', '/ResetPassword'];

    useEffect(() => {
        const user = checkUser();
        const pathIsPublic = publicPaths.some(p => pathname.startsWith(p));

        // 1. If not logged in and trying to access a protected route, redirect to login.
        if (!user && !pathIsPublic) {
            router.push('/Login');
            return;
        }

        // 2. If logged in and trying to access a public route (e.g., login page), redirect to dashboard.
        if (user && pathIsPublic) {
            router.push('/'); // Redirect to the main dashboard
            return;
        }

        // 3. If none of the above, the user is authorized to see the page.
        setIsLoading(false);
    }, [pathname, router]);

    // Prevents a flash of content while authentication is being checked.
    if (isLoading) {
        return null; // Or you can return a global loading spinner component
    }

    return children;
}