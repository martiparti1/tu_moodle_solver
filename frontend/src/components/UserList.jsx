import axios from 'axios';

export default function UserList({users, setUsers}){

    async function handleDeleteClick(e){
        let delete_this = e.currentTarget.closest('div[data-id]')?.dataset.id;

        await axios.post('http://localhost:3000/delete-user', {delete_id : delete_this})

        setUsers(prev => prev.filter(user => user.id != delete_this))
    }

    async function handleToggleClick(e, type){
        //!for type use the column name from the db
        let toggle_this = e.currentTarget.closest('div[data-id]')?.dataset.id;

        await axios.post("http://localhost:3000/toggle-user_property", {user_id : toggle_this, toggle_type : type})

        setUsers(prev => prev.map(user => user.id == toggle_this ? {
                ...user,
                //* admin = (if type = is_admin) {!user.admin} else {user.admin}
                admin : type == "is_admin" ? !user.admin : user.admin,
                special : type == "is_special" ? !user.special : user.special
            } : user
        ))
    }

    return(
        <div className = "flex flex-col">
            {users.map((user) => 
                <div key = {user.id} data-id = {user.id} className="flex flex-col min-w-[30dvw] bg-gray-300 rounded-md my-[10px] p-[5px] shadow-lg gap-[10px]">
                    
                    <div className="flex flex-row justify-between">
                        
                        <p><b>Username : </b> {user.username}</p>
                        <button 
                            className="bg-red-400 text-white rounded-md px-[7px] active:scale-95 min-h-[30px]"
                            onClick = {handleDeleteClick}
                        ><b>DELETE THIS GUY</b></button>
                    </div>
                    <p>Email <span className="text-gray-500 text-[12px]">/username/</span> : {user.email != null ? user.email : "none"}</p>

                    <div className="flex flex-row justify-between">
                        <p>Admin : {user.admin ? <span className="text-green-500 font-bold" >YES</span> : <span className="text-red-500 font-bold"> NO </span>}</p>
                        <button
                            className="bg-cyan-400 text-white rounded-md px-[7px] active:scale-95 min-h-[30px]"
                            onClick={(e) => handleToggleClick(e, "is_admin")}
                        >
                            toggle admin
                        </button>
                    </div>

                    <div className="flex flex-row justify-between">
                        <p>Special : {user.special ? <span className="text-green-500 font-bold" >YES</span> : <span className="text-red-500 font-bold"> NO </span>}</p>
                        <button
                            className="bg-cyan-400 text-white rounded-md px-[7px] active:scale-95 min-h-[30px]"
                            onClick={(e) => handleToggleClick(e, "is_special")}
                        >
                            toggle special
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}