import { useState } from "react";
import axios from 'axios'

axios.defaults.withCredentials = true; //send cookies

export default function CreateAccountForm(){

    const[newUser, setNewUser] = useState({
        username : '',
        email : '',
        password : '',
        isSpecial : false,
        isAdmin : false,
    });

    const [messages, setMessages] = useState({
        username_err : false,
        email_err : false,
        password_err : false,
        backend_err : false,
        success_msg : false
    })

    async function createUser(){

        
        setMessages(prev =>({...prev, backend_err : false, success_msg : false}))
        const newErrors = {};
        newUser.username == '' ? newErrors.username_err = true : newErrors.username_err = false;
        
        newUser.email == '' ? newErrors.email_err = true : newErrors.email_err = false;
        
        newUser.password == '' ? newErrors.password_err = true : newErrors.password_err = false;

        if(Object.values(newErrors).includes(true)){
            setMessages(prev => ({...prev, ...newErrors}));
            return;
        }

        try{
            await axios.post("http://localhost:3000/create-user", { newUser : newUser });

            setMessages({...messages, success_msg : true, backend_err : false})
            
        }catch(err){ 
            setMessages({...messages, success_msg : false, backend_err : true}); 
        }
        setNewUser({
            username : '',
            email : '',
            password : '',
            isSpecial : false,
            isAdmin : false,
        });

        setMessages(prev => ({...prev, username_err : false, email_err : false, password_err : false}))
    }

    return(
        <div className="flex flex-col justify-center items-center min-w-[30vw]">
            

            <div className="flex flex-col items-center mb-[10px]">
                <input 
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e)=>{setNewUser({...newUser, username : e.target.value})}}
                    className="bg-gray-300 w-[20vw] p-[3px] box-border rounded-md"
                />
                { messages.username_err == true && (<p className="text-red-500 text-[12px] mb-[5px]">Username can't be empty!</p>) }
            </div>


            <div className="flex flex-col items-center mb-[10px]">
                <input 
                    type="text"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e)=>{setNewUser({...newUser, email : e.target.value})}}
                    className="bg-gray-300 w-[20vw] p-[3px] box-border rounded-md"
                />
                { messages.email_err && (<p className="text-red-500 text-[12px] mb-[5px]">Email can't be empty!</p>) }
            </div>


            <div className="flex flex-col items-center mb-[10px]">
                <input 
                    type="text"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e)=>{setNewUser({...newUser, password : e.target.value})}}
                    className="bg-gray-300 w-[20vw] p-[3px] box-border rounded-md"
                />
                { messages.password_err && (<p className="text-red-500 text-[12px] mb-[5px]">Password can't be empty!</p>) }
            </div>
            <div className="flex flex-row  w-[20vw] justify-around mb-[10px]">
                <div className="flex flex-row  gap-[5px]">
                    <p>Special Account : </p>
                    <input 
                    type="checkbox" 
                    value={newUser.isSpecial}
                    onChange={(e)=>{setNewUser({...newUser, isSpecial : e.target.checked})}}
                    />
                </div>

                <div className="flex flex-row  gap-[5px]">
                    <p>Admin : </p>
                    <input 
                    type="checkbox" 
                    value={newUser.isAdmin}
                    onChange={(e)=>{setNewUser({...newUser, isAdmin : e.target.checked})}}/>
                </div>
            </div>
            <button className="w-[20vw] bg-green-500 rounded-md active:scale-95 h-[40px] text-white text-[24px]" onClick={createUser}> Create new user</button>

            { messages.success_msg && (
                <p className="text-[28px] text-emerald-500">Account successfully created!</p>
            )}

            { messages.backend_err && (
                <p className="text-[28px] text-red-500">Backend error!</p>
            )}
        </div>
    );
}