import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API = axios.create({
    baseURL: `${BASE_URL}/api/auth`,
    withCredentials: true
});

// Attach Authorization header if token exists in localStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function register(username, email, password) {
    try {
        const response = await API.post("/register", {
            username,
            email,
            password
        });
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
}

export async function login(email, password) {
    try {
        const response = await API.post("/login", {
            email,
            password
        });
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export async function logout() {
    try {
        const response = await API.post("/logout");
        localStorage.removeItem("token");
        return response.data;
    } catch (error) {
        localStorage.removeItem("token");
        console.error("Logout error:", error);
        throw error;
    }
}

export async function getMe() {
    try {
        const response = await API.get("/get-me");
        return response.data;
    } catch (error) {
        console.error("GetMe error:", error);
        throw error;
    }
}