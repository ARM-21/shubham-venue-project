"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

   async function getProfile() {
    try {
        // First validate session on server to detect stale/invalid cookies
        const validateRes = await axiosInstance.get(ROUTES.API.AUTH.VALIDATE_SESSION);
        
        if (validateRes?.data?.isValid && validateRes?.data?.user) {
            // Session is valid, use the user from session validation
            setUser(validateRes.data.user);
        } else {
            // Session is invalid or doesn't exist, try to get profile
            try {
                const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
                const user = res?.data?.user ?? res?.data ?? null;

                if (user && user.isEmailVerified === false) {
                    setUser(null);
                } else {
                    setUser(user);
                }
            } catch (err) {
                // Profile also failed - not authenticated
                setUser(null);
            }
        }
    } catch (err) {
        console.error("Profile/session validation error:", err);
        // If validation fails, try profile endpoint as fallback
        try {
            const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
            const user = res?.data?.user ?? res?.data ?? null;

            if (user && user.isEmailVerified === false) {
                setUser(null);
            } else {
                setUser(user);
            }
        } catch (e) {
            setUser(null);
        }
    } finally {
        setLoading(false);
    }
}


    useEffect(() => {
        getProfile();
    }, []);


    const login = async (credentials) => {
        const res = await axiosInstance.post(ROUTES.API.AUTH.LOGIN, credentials);
             const maybeUser = res?.data?.user ?? res?.data ?? null;
        if (maybeUser) setUser(maybeUser);

        try {
            const me = await axiosInstance.get(ROUTES.API.PROFILE.ME);
            setUser(me?.data?.user ?? me?.data ?? maybeUser);
        } catch (e) {
            console.log("login failed",e)
        }
        return res;
    };

    const logout = async () => {
        try {
            await axiosInstance.post(ROUTES.API.AUTH.LOGOUT);
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
