import { useNavigate } from "react-router-dom";

export default function Placeholder(){
    const navigate = useNavigate();
    return(
        <div className="min-h-screen bg-gray-500 flex justify-center items-center rounded-sm">
            <div className="bg-white h-[30vh] w-[50vw] flex flex-col justify-center items-center">
                
                <p className="text-black font-bold">HELLO THIS IS PLACEHOLDER PAGE</p>

                <button 
                type="button" 
                className="
                    min-w-[15vw] min-h-[4dvh] bg-blue-500 text-white text-[20px] font-bold rounded-sm active:scale-95 transition-all duration-200
                    cursor-pointer"
                onClick = {()=>navigate('/login')}
                > PROCEED TO LOGIN BROOO </button>
            </div>
        </div>
    );
} 