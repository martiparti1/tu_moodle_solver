const express = require('express');
const cors = require('cors');
const http = require('http');
const {WebSocketServer} = require('ws');
const {solveQuiz} = require('./solveQuiz_v2.js');
const {sql} = require('./db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app) //wrap express with http server for both services on one port
const wss = new WebSocketServer({server});
let sockets = [];


//? rest
app.post('/start-quiz', async(req,res)=>{
    const {quizUrl, quizPassword, moodlePassword} = req.body;

    const cookie = jwt.verify(req.cookies.token, JWT_SECRET);

    const user = await sql`SELECT * FROM app_accounts WHERE id = ${cookie.userId}`

    if(!quizUrl || quizUrl == '') return res.status(400).json({badUrl : true})

    try{
        await solveQuiz(quizUrl, quizPassword, user[0].moodle_email, moodlePassword);
        res.status(200).send('quiz solving done i believe???')
    }catch(err){
        res.status(500).send(err);
    }
});

app.post('/login', async (req,res)=>{
    const {inputUsername,inputPassword} = req.body

    const user = await sql`
        SELECT aa.id as id, aa.password_hash as password_hash, ad.is_admin as isAdmin 
        FROM app_accounts aa 
        JOIN account_details ad on aa.id = ad.account_id
        WHERE username = ${inputUsername}
    `;
    
    if(user.length === 0) {
        console.log("Account doesn't exist")
        return res.status(401).json({ message : "Invalid login"})
    }

    const match = await bcrypt.compare(inputPassword, user[0].password_hash)

    if(match){

        const token = jwt.sign(
            {
                userId : user[0].id,
                isLoggedIn : true,
                isAdmin : user[0].isadmin
            },
            JWT_SECRET,
            {expiresIn : '1h'}
        )
        console.log(`\n ------USER FETCH SHIII SHIIII------ \n`)
        console.log(user[0])
        console.log(`\n ------------------ \n`)
        res.cookie("token", token, {
            httpOnly : true,
            secure : false, //put true for production
            maxAge : 3600000 //1 hour
        })

        console.log(`Hello and welcome ${user[0].username}`);
        console.log(`hey new use your admin status is : ${user[0].isAdmin}`)
        return res.sendStatus(200);
    }
    else{
        console.log("wrong password broman");
        res.status(401).json({message : "Invalid login"})
    }

})

app.post('/create-user', async (req, res) => {
    const {newUser} = req.body;

    //TODO hash password, insert into app_accounts and remaining in account_details
    try{
        const hashed_pass = await bcrypt.hash(newUser.password, 12);

        let newUser_id = await sql`
        INSERT INTO app_accounts (username, password_hash)
        VALUES (${newUser.username}, ${hashed_pass})
        RETURNING id`;


        await sql`
        UPDATE account_details 
        SET mdl_email = ${newUser.email},
            is_special = ${newUser.isSpecial},
            is_admin = ${newUser.isAdmin}
        WHERE account_id = ${newUser_id[0].id}`;

        return res.sendStatus(200);
    }catch{
        return res.sendStatus(200);
    }
})

app.post('/delete-user', async (req, res) => {
    const {delete_id} = req.body;

    await sql`DELETE FROM app_accounts WHERE id = ${delete_id}`

    return res.sendStatus(200);
})

app.post('/toggle-special', async (req,res) => {
    const {user_id} = req.body;

    const toggle_this_user = await sql`SELECT is_special FROM account_details WHERE account_id = ${user_id}`
    
    console.log(toggle_this_user[0]);
    console.log(typeof toggle_this_user[0].is_special);

    const new_status = !toggle_this_user[0].is_special;

    console.log(`new status of the fucker is ${new_status   }`)
})

app.get('/check-auth', (req, res) => {
    const token = req.cookies.token;

    if(!token) return res.status(401).json({isLoggedIn : false})

    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(`admin? : ${decoded.isAdmin} \nlogged in? : ${decoded.isLoggedIn}`) 

        if(decoded.isLoggedIn) return res.status(200).json({isLoggedIn : true, isAdmin : decoded.isAdmin}) 
        return res.status(401).json({isLoggedIn : false})

    }catch {
        res.status(401).json({isLoggedIn : false})
    }
})

app.get('/get-users', async(req, res) =>{
    const users = await sql`
        SELECT aa.id as id, aa.username as username, ad.mdl_email as email, ad.is_special as special, ad.is_admin as admin, ad.is_active as active
        FROM account_details ad
        JOIN app_accounts aa on ad.account_id = aa.id
    `;

    return res.status(200).json(users);
})

//? websockets
wss.on("connection", (ws) => {
    sockets.push(ws);

    ws.on('close', ()=>{
        sockets.filter(s => s !==ws )
    })
})

server.listen(3000, ()=>console.log("server & websocket listening on port 3000"))