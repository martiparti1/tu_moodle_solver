const express = require('express');
const cors = require('cors')
const http = require('http')
const {WebSocketServer} = require('ws')
const {solveQuiz} = require('./solveQuiz_v2.js');
const {sql} = require('./db.js')
const bcrypt = require('bcrypt');


const app = express();
app.use(cors());
app.use(express.json());

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
    const {inputEmail,inputPassword} = req.body

    const user = await sql`SELECT * FROM app_accounts WHERE email = ${inputEmail}`

    if(user.length === 0) {
        console.log("Account doesn't exist")
        return res.status(401).send("Account doesnt exist")
    }
    const match = await bcrypt.compare(inputPassword, user[0].password_hash)

    if(match){
        console.log(`Hello and welcome ${user[0].email}`);
        res.sendStatus(200);
    }
    else{
        console.log("wrong password broman");
        res.sendStatus(401)
    }
})

server.listen(3000, ()=>console.log("server & websocket listening on port 3000"))