import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import React from 'react'

export async function loginAction(data) {
    console.log(data)
    const response = axiosInstance.post(`/api/v1/auth/login`, data);
    console.log(response)

    const res = await toast.promise(response, {
        loading: "Loggin in...",
        success: (response) => response?.data.message || "Login Failed",
        error: (err) => { throw new Error(err?.response?.data?.message + " ! Try Again" || "Login Failed ! Try Again") }
    })
    return res


}
