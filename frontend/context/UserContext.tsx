"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { fetchProfile, refillHearts as apiRefillHearts } from '@/lib/api';

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    initializing: boolean;
    refreshUser: () => Promise<void>;
    refillHearts: () => Promise<void>;
    updateLocalUser: (updates: Partial<UserProfile>) => void;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    const refreshUser = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const data = await fetchProfile();
            setUser(data);
        } catch (e) {
            console.error(e);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token: string) => {
        localStorage.setItem("token", token);
        await refreshUser();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/login";
    };

    const refillHearts = async () => {
        try {
            const data = await apiRefillHearts();
            if (user) {
                setUser({ ...user, hearts_current: data.hearts_current });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateLocalUser = (updates: Partial<UserProfile>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    useEffect(() => {
        refreshUser().finally(() => setInitializing(false));
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, initializing, refreshUser, refillHearts, updateLocalUser, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
