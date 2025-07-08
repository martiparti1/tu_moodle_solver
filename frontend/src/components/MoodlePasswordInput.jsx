import { useState } from "react";


//!THIS NEEDS TO PASS MOODLEPASSWORD TO PARENT 


export default function MoodlePasswordInput({mdlPass, setMdlPass}){
    const [input, setInput] = useState("");
    return (
        <>
            <p className='font-bold text-[24px] align-self-start'>Password for your moodle account:</p>
            <input 
                type="text" 
                className="input-m w-[30dvw]"
                placeholder="" 
                // disabled = {isLoading}
                onChange={(e)=>setInput(e.target.value)}
                value = {input}
            />

            <p className='text-[16px] py-[5px]'>Your password isn't stored in our database; it gets sent straight to the bot so that it can log in</p>
            <button
                type = "button"
                className='min-w-[15dvw] min-h-[4dvh]  text-white font-bold rounded-lg cursor-pointer bg-green-500 active:bg-green-600 active:scale-95'
                onClick={()=> setMdlPass(input)}
            >
                ➡ Proceed ➡
            </button>
        </>
    );
}