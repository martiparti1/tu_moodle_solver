const express = require('express');
const cors = require('cors')
const {solveQuiz} = require('./solveQuiz.js')

const app = express();
app.use(cors());
app.use(express.json());

app.post('/start-quiz', async(req,res)=>{
    const {quizUrl} = req.body;


    if(!quizUrl || quizUrl == '') return res.status(400).json({badUrl : true})

    try{
        await solveQuiz(quizUrl);
        res.status(200).send('quiz solving done i believe???')
    }catch(err){
        res.status(500).send(err);
    }
});

app.listen(3000, ()=>console.log("listening on port 3000"))