import axios from 'axios';
import { useState } from 'react';
import UserList from '../components/UserList.jsx';
import CreateAccountForm from '../components/CreateAccountForm.jsx'
axios.defaults.withCredentials = true; //send cookies

export default function AdminPanel(){
    

    const [displayUsers, setDisplayUsers] = useState(false);
    const [displayRegisterField, setDisplayRegisterField] = useState(false);
    const [users, setUsers] = useState([]);
    async function listUsers(){
        const res = await axios.get("http://localhost:3000/users");

        console.log(res.data)
        setUsers(res.data);

        setDisplayUsers(true);
        setDisplayRegisterField(false)
    }

    function createNewAccount(){
        setDisplayUsers(false);
        setDisplayRegisterField(true);
    }

    return(
        <>
            <title>MDLSolver ADMIN</title>
            <div className="min-h-screen bg-gray-500 flex justify-center items-center">

                <div className="min-h-[50dvh] min-w-[70dvw] bg-white rounded-lg shadow-black flex flex-col justify-center items-center p-[10px]"> 
                    <p>Admin panel</p>

                    <div className='flex gap-[20px] my-[20px]'>
                        <button 
                        className='p-[5px] min-w-[15dvw] min-h-[40px] bg-blue-500 text-white rounded-lg font-semibold cursor-pointer active:scale-95'
                        onClick={listUsers}>List users 🐱‍🐉</button>
                        <button 
                        className='p-[5px] min-w-[15dvw] min-h-[40px] bg-blue-500 text-white rounded-lg font-semibold cursor-pointer active:scale-95'
                        onClick={createNewAccount}
                        >Create new account 🦠</button>

                    </div>

                    {displayUsers && (
                        <UserList users={users} setUsers={setUsers}/>
                    )}

                    {displayRegisterField && (
                        <CreateAccountForm/>
                    )}
                </div>
                
            </div>
        </>
    );

}   