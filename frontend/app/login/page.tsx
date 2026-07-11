"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();
    const { login } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const data = await apiLogin({ username, password });
            await login(data.access_token);
            router.push('/');
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-duo-bg p-4">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
                    <p className="text-gray-500">Sign in to continue learning.</p>
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Email or Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-duo-green focus:outline-none transition-colors"
                            placeholder="Enter your email or username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-duo-green focus:outline-none transition-colors"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className="w-full py-4 font-extrabold uppercase tracking-wider rounded-2xl text-lg transition-colors duration-150 outline-none bg-duo-green text-white hover:brightness-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 4px 0 #46A302' }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "LOG IN"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 font-bold">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-duo-blue hover:underline">
                            SIGN UP
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
