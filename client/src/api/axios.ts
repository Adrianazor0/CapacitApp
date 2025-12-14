import axios, { type InternalAxiosRequestConfig } from "axios";

const client = axios.create({
    baseURL : "http://localhost:4000/api",
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