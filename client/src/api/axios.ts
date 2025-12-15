import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({
    baseURL,
    headers : {
        "Content-Type" : "application/json",
    }
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

export default client