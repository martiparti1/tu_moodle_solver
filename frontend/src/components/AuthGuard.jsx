import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthGuard({children}){

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        axios.get("http://localhost:3000/check-auth", {withCredentials : true})
        .then(res => {
            if(!res.data.isLoggedIn) navigate('/login')
            else setLoading(false)
        })
        .catch(() => navigate('/login'))
    }, []);

    if(loading) return null;
    else return children;
}