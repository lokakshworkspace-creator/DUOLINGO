"use client";
import { useUser } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, initializing } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    useEffect(() => {
        if (!initializing) {
            if (!user && !isAuthRoute) {
                router.push('/login');
            } else if (user && isAuthRoute) {
                router.push('/');
            }
        }
    }, [user, initializing, router, isAuthRoute]);

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-duo-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-duo-green"></div>
            </div>
        );
    }

    if (!user && !isAuthRoute) {
        return null;
    }

    return <>{children}</>;
}
