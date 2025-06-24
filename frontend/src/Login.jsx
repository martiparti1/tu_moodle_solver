import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true; //send cookies

export default function Login(){
    const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error,setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [loginSuccess, setLoginSuccess] = useState(false)



    async function handleLogin(){
        
        setLoginSuccess(false);
        setIsLoading(true);
        setError("");


        if(!username || !password) {
            setError("Fill all fields");
            setIsLoading(false);
            return;
        }
        try{
            await axios.post(("http://localhost:3000/login"), {
                inputUsername: username,
                inputPassword : password
            });

            setLoginSuccess(true);
            setIsLoading(false);
            navigate('/test')
            
        } catch(err){
            setIsLoading(false);
            setError(err.response.data.message);
        }

    }

    return(
        <div className="min-h-screen bg-gray-500 flex justify-center items-center">
            <form className="bg-white h-[30vh] w-[50vw] flex flex-col justify-center items-center rounded-sm shadow-sm shadow-black">

                <input 
                    type="text" 
                    className="input-m mb-[5px]" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => {setUsername(e.target.value)}} 
                    disabled={isLoading}
                />

                <input 
                    type="password" 
                    className="input-m mb-[5px]" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e)=>{setPassword(e.target.value)}} 
                    disabled={isLoading}
                 />

                {error && (
                    <div className="border border-red-200 bg-red-50 flex flex-row justify-center rounded-sm p-[5px] gap-[5px]">
                        <span>⚠️</span>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {loginSuccess && (
                    <div className="border border-green-200 bg-green-50 flex flex-row justify-center rounded-sm gap-[5px] p-[5px]">
                        <span>✅</span>
                        <p className="text-green-600">Login successful!</p>
                    </div>
                )}
                
                <button 
                    type = "button"
                    className= {
                        `min-w-[200px] min-h-[35px] mt-[10px] font-bold rounded-md text-[20px]
                        ${ isLoading ? 
                            `bg-gray-400 cursor-not-allowed ` : 
                            `bg-green-500 hover:bg-green-400 cursor-pointer text-white active:scale-95 transition-all duration-200`
                        }`
                    }
                    onClick={handleLogin}
                    disabled = {isLoading}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center gap-[10px]">
                            <span className="animate-spin">⏳</span>
                            <p>Logging in...</p>
                        </div>
                    ) : (
                        'Log in'
                    )}
                    
                </button>
            </form>
        </div>
    );
} 