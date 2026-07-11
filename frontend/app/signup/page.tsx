"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register as apiRegister } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();
    const { login } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        setIsLoading(true);

        try {
            const data = await apiRegister({ 
                username, 
                email, 
                display_name: displayName,
                password 
            });
            await login(data.access_token);
            router.push('/');
        } catch (err: any) {
            setError(err.message || "Failed to register");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-duo-bg p-4">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create your profile</h1>
                    <p className="text-gray-500">Start learning today.</p>
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-duo-green focus:outline-none transition-colors"
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-duo-green focus:outline-none transition-colors"
                            placeholder="e.g. john_doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-duo-green focus:outline-none transition-colors"
                            placeholder="e.g. john@example.com"
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
                            placeholder="Create a password"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 focus:border-duo-green focus:outline-none transition-colors"
                            placeholder="Confirm your password"
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
                            {isLoading ? "Creating account..." : "CREATE ACCOUNT"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 font-bold">
                        Already have an account?{" "}
                        <Link href="/login" className="text-duo-blue hover:underline">
                            LOG IN
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
