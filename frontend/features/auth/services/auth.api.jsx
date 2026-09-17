import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true
});

export async function register(username, email, password) {
    try {
        const response = await API.post("/register", {
            username,
            email,
            password
        });
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
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export async function logout() {
    try {
        const response = await API.post("/logout");
        return response.data;
    } catch (error) {
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