import React from "react"
import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth.js"

const Protected = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) {
        return <div>loading...</div>
    }
    if (!user) {
        return <Navigate to="/login" replace />
    }
    return children
}

export default Protected