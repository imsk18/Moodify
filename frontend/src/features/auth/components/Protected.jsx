import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate, useNavigate } from 'react-router-dom'

const Protected = ({children})=>{
    const {loading ,user } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!loading && !user) {
        console.log("❌ NO USER → LOGIN");
        return <Navigate to="/login" replace />;
    }

    console.log("✅ USER EXISTS → HOME");

    return children;
}


export default Protected