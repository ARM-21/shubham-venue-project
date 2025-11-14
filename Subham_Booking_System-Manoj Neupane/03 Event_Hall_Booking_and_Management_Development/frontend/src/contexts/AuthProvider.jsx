"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount try to load session (backend should use HttpOnly cookie/session)
    useEffect(() => {
        let mounted = true;
        async function init() {
            try {
                const res = await axiosInstance.get("/api/v1/profile/me");
                if (!mounted) return;
                setUser(res?.data?.user ?? res?.data ?? null);
            } catch (err) {
                if (!mounted) return;
                setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        init();
        return () => {
            mounted = false;
        };
    }, []);

    // login: send credentials to server; server should set cookie/session
    const login = async (credentials) => {
        const res = await axiosInstance.post("/api/v1/auth/login", credentials);
        console.log(res)
        // optimistic set user from login response if backend returns user/token
        const maybeUser = res?.data?.user ?? res?.data ?? null;
        if (maybeUser) setUser(maybeUser);
        // also refresh session/user from server to ensure consistency
        try {
            const me = await axiosInstance.get("/api/v1/profile/me");
            setUser(me?.data?.user ?? me?.data ?? maybeUser);
        } catch (e) {
            // ignore
        }
        return res;
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/api/v1/auth/logout");
        } catch (e) {
            // ignore
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === null) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
