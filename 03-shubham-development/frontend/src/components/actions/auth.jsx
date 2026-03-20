import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import React from 'react'
import { ROUTES } from 'config/routes';

export async function loginAction(data) {
    console.log(data)
    const response = axiosInstance.post(ROUTES.API.AUTH.LOGIN, data);
    console.log(response)

    const res = await toast.promise(response, {
        loading: "Loggin in...",
        success: (response) => response?.data.message || "Login Failed",
        error: (err) => { throw new Error(err?.response?.data?.message + " ! Try Again" || "Login Failed ! Try Again") }
    })
    return res


}
