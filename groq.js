const {Groq} = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({apiKey : process.env.GROQ_API_KEY});

async function answerQuestion(questionData){
    const prerequisite = await groq.chat.completions
    .create({
        messages : [
            {
                role: "user",
                content : JSON.stringify(questionData)
            }
        ],
        model : "llama-3.3-70b-versatile"
    })
    .then ((chatCompletion) => {
        console.log(chatCompletion.choices[0]?.message?.content || "")
    })
}


module.exports = {answerQuestion};