"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

   async function getProfile() {
    try {
        const res = await axiosInstance.get("/api/v1/profile/me");
        const user = res?.data?.user ?? res?.data ?? null;

        if (user && user.isEmailVerified === false) {
            setUser(null);
        } else {
            setUser(user);
        }
    } catch (err) {
        setUser(null);
    } finally {
        setLoading(false);
    }
}


    useEffect(() => {
        getProfile();
    }, []);


    const login = async (credentials) => {
        const res = await axiosInstance.post("/api/v1/auth/login", credentials);
             const maybeUser = res?.data?.user ?? res?.data ?? null;
        if (maybeUser) setUser(maybeUser);

        try {
            const me = await axiosInstance.get("/api/v1/profile/me");
            setUser(me?.data?.user ?? me?.data ?? maybeUser);
        } catch (e) {
            console.log("login failed",e)
        }
        return res;
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/api/v1/auth/logout");
        } catch (e) {
            console.error("Logout failed:", e);
        } finally {
            setUser(null);
        }
    };

    const googleLogin = async (response) => {
        const res = await axiosInstance.post("/api/v1/auth/google/login", { token: response.credential })
        setUser(res?.data?.user ?? res?.data.user ?? null);
        return res;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, setLoading, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === null) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
