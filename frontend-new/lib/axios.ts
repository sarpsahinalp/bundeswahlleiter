import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

// Add a request interceptor for authentication if needed
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token")
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`
//         }
//         return config
//     },
//     (error) => {
//         return Promise.reject(error)
//     },
// )

// Add a response interceptor for error handling
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Handle unauthorized access
//             localStorage.removeItem("token")
//             window.location.href = "/login"
//         }
//         return Promise.reject(error)
//     },
// )

export default api

