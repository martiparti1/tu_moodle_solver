import axios from 'axios';

export default function UserList({users, setUsers}){

    async function handleDeleteClick(e){
        let delete_this = e.currentTarget.closest('div[data-id]')?.dataset.id;

        await axios.post('http://localhost:3000/delete-user', {delete_id : delete_this})

        setUsers(prev => prev.filter(user => user.id != delete_this))
    }

    return(
        <div className = "flex flex-col">
            {users.map((user) => 
                <div key = {user.id} data-id = {user.id} className="flex flex-col min-w-[30dvw] bg-gray-300 rounded-lg my-[10px] p-[5px] shadow-lg">
                    
                    <div className="flex flex-row justify-between">
                        
                        <p><b>Username : </b> {user.username}</p>
                        <button 
                        className="bg-red-400 text-white rounded-lg px-[7px] active:scale-95 min-h-[30px]"
                        onClick = {handleDeleteClick}
                        ><b>DELETE THIS GUY</b></button>
                    </div>
                    <p>Email : {user.email != null ? user.email : "none"}</p>

                    <div className="flex flex-row justify-between">
                        <p>Admin : {user.admin ? <span className="text-green-500 font-bold" >YES</span> : <span className="text-red-500 font-bold"> NO </span>}</p>
                        <button>toggle admin</button>
                    </div>

                    <div className="flex flex-row justify-between">
                        <p>Special : {user.special ? <span className="text-green-500 font-bold" >YES</span> : <span className="text-red-500 font-bold"> NO </span>}</p>
                        <button>toggle special</button>
                    </div>
                </div>
            )}
        </div>
    );
}