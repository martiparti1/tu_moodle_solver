const express = require('express');
const cors = require('cors')
const http = require('http')
const {WebSocketServer} = require('ws')
const {solveQuiz} = require('./solveQuiz_v2.js');
const {sql} = requite('./db.js')

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app) //wrap express with http server for both services on one port

const wss = new WebSocketServer({server});
let sockets = [];

wss.on("connect", (ws) => {
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
    //add login logic here???
    const {email,password} = req.body
})

server.listen(3000, ()=>console.log("server & websocket listening on port 3000"))