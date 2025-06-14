import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error,setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [loginSuccess, setLoginSuccess] = useState(false)

    const script_regex = /<(script)[^>]*>.*<\/\1>/g;

    const validation_handling = [
        {
            test : () => !email || !password,
            message : "Fill all fields"
        },
        {
            test : ()=> script_regex.test(email) || script_regex.test(password),
            message : "fuck you"
        }
    ]

    // function checkInput(){
    //     setIsLoading(true);
    //     setError("");
    //     setLoginSuccess(false);

    //     setTimeout(()=>{
    //         const failedValidation = validation_handling.find(rule => rule.test())

    //         if (failedValidation) setError(failedValidation.message) 
    //         else{
    //             setIsLoading(false)
    //             setLoginSuccess(true)
    //             navigate('/test')
    //         }

    //     },1000)
        
        
    // }


    async function handleLogin(){
        try{
            await axios.post(("http://localhost:3000/login"), {
                inputEmail: email,
                inputPassword : password
            });
            
        } catch(err){

        }

    }

    return(
        <div className="min-h-screen bg-gray-500 flex justify-center items-center">
            <form className="bg-white h-[30vh] w-[50vw] flex flex-col justify-center items-center rounded-sm shadow-sm shadow-black">

                <input 
                    type="text" 
                    className="input-m mb-[5px]" 
                    placeholder="example@email.com" 
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}} 
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
                    data-someval = 'PESHOEEEEE'
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