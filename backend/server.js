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

wss.on("connection", (ws) => {
    sockets.push(ws);

    ws.on('close', ()=>{
        sockets.filter(s => s !==ws )
    })
})

app.post('/start-quiz', async(req,res)=>{
    const {quizUrl, quizPassword} = req.body;


    if(!quizUrl || quizUrl == '') return res.status(400).json({badUrl : true})

    try{
        await solveQuiz(quizUrl, quizPassword);
        res.status(200).send('quiz solving done i believe???')
    }catch(err){
        res.status(500).send(err);
    }
});

app.post('/login', async (req,res)=>{
    const {inputUsername,inputPassword} = req.body

    const user = await sql`SELECT * FROM app_accounts WHERE username = ${inputUsername}`
    
    if(user.length === 0) {
        console.log("Account doesn't exist")
        return res.status(401).json({ message : "Invalid login"})
    }

    const match = await bcrypt.compare(inputPassword, user[0].password_hash)

    if(match){

        const token = jwt.sign(
            {
                isLoggedIn : true,
                isAdmin : user[0].isAdmin,
                moodle_email : user[0].moodle_email
            },
            JWT_SECRET,
            {expiresIn : '1h'}
        )

        res.cookie("token", token, {
            httpOnly : true,
            secure : false, //put true for production
            maxAge : 3600000
        })

        console.log(`Hello and welcome ${user[0].username}`);
        return res.sendStatus(200);
    }
    else{
        console.log("wrong password broman");
        res.status(401).json({message : "Invalid login"})
    }

})

app.get('/check-auth', (req, res) => {
    const token = req.cookies.token;

    if(!token) return res.status(401).json({isLoggedIn : false})

    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        if(decoded.isLoggedIn) return res.status(200).json({isLoggedIn : true, isAdmin : decoded.isAdmin}) 
            
        return res.status(401).json({isLoggedIn : false})

    }catch {
        res.status(401).json({isLoggedIn : false})
    }
})

server.listen(3000, ()=>console.log("server & websocket listening on port 3000"))