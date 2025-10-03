import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;

export default function AuthGuard({admin = false, children}){

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        axios.get("http://localhost:3000/auth", {withCredentials : true})
        .then(res => {
            //! annoying to read lol
            res.data.isLoggedIn ? ((admin && !res.data.isAdmin) ? navigate('/test') : setLoading(false)) : navigate("/login")
        })
        .catch(() => navigate('/login'))
    }, []);

    if(loading) return null;
    else return children;
}