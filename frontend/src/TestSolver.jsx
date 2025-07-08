import { useState } from 'react';
import example from './assets/example.png'
import axios from 'axios';
import MoodlePasswordInput from './MoodlePasswordInput';

axios.defaults.withCredentials = true; //send cookies


export default function TestSolver(){

    const [hasExample, setHasExample] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [quizPassword, setQuizPassword] = useState("")
    const [quizLinkInput, setQuizLinkInput] = useState("");
    const [moodlePassword, setMoodlePassword] = useState("");
    const [quizResult, setQuizResult] = useState("");
    const [err, setErr] = useState("")
    

    

    async function handleClick(){
        setErr("");
        setQuizResult("")
        setHasExample(false);
        setIsLoading(true);

        try {

            const res = await axios.post("http://localhost:3000/start-quiz", {
                // userId : 
                quizUrl : quizLinkInput,
                quizPassword : quizPassword,
                moodlePassword : moodlePassword
            });

            setQuizResult(res.data)

        } catch(err) {
            switch(err.response.status){
                case 400 :
                    setErr("The URL you have sent is invalid!");
                    break;
                case 500 :
                    setErr("The solver program crashed unexpectedly! Please try again! If the erorr persists contact admin");
                    break;
            }

            setHasExample(true)
        }

        setIsLoading(false)
    }

    // async function handleClick(){
    //     // await axios.get("http://localhost:3000/cookie-test");
    //     console.log(moodlePassword)
    // }

    return(
        <>
            <title>Quiz submit</title>
            <div className="min-h-screen bg-gray-500 flex justify-center items-center">
                
                    <div className="min-h-[50dvh] min-w-[70dvw] bg-white rounded-lg shadow-black flex flex-col justify-center items-center p-[10px]">          
                    { moodlePassword != "" ? 
                        (
                            <>
                                {hasExample && (
                                    <>
                                        <p className="text-red-500 text-center">
                                            <span className="font-bold text-[30px]"> !! IMPORTANT : </span> 
                                            <span className="text-[25px]">all links must point to the page where the button for starting the quiz is, as shown in the image</span>
                                        </p>

                                        

                                        <img 
                                        className='border-2 border-black my-[10px]'
                                        src={example} 
                                        alt="quiz start example" 
                                        />  
                                    </>
                                )}

                                <div className={`flex flex-col justify-between items-center gap-[10px] min-w-[50dvw]`}>
                                    <input 
                                        type="text" 
                                        className="input-m w-[30dvw]"
                                        placeholder="quiz link here" 
                                        disabled = {isLoading}
                                        onChange={(e)=>setQuizLinkInput(e.target.value)}
                                    />

                                    <input 
                                        type="text" 
                                        className="input-m w-[30dvw]"
                                        placeholder="quiz password here (leave empty if no password)" 
                                        disabled = {isLoading}
                                        onChange={(e)=>setQuizPassword(e.target.value)}
                                    />
                                    <button
                                        type = "button"
                                        className = {`min-w-[15dvw] min-h-[4dvh]  text-white font-bold rounded-lg cursor-pointer ${isLoading ? `bg-orange-400 ` : `bg-green-500 active:bg-green-600 active:scale-95`}`} 
                                        // onClick={()=> {setHasExample(false) ; setIsLoading(true)}}
                                        onClick={handleClick}
                                        disabled = {isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex justify-center gap-[10px]">
                                                <span className="animate-ping">⚡</span>
                                                <p>Solving with A.I.</p>
                                                <span className="animate-bounce" style={{animationDelay : '0s'}}>🧠</span>
                                                <span className="animate-bounce" style={{animationDelay : '0.5s'}}>💻</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <p>Solve</p>
                                                <span>✅</span>
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {quizResult != '' && (
                                    <p className='text-[25px] text-green-300'>{quizResult}</p>
                                )}


                                {err && (
                                    <p className="text-[25px] text-red-400"> {err}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <MoodlePasswordInput mdlPass={moodlePassword} setMdlPass={setMoodlePassword}/>
                            </>  
                        )
                    }
                    
                </div>
                
            </div>
        </>

        
    );
} 