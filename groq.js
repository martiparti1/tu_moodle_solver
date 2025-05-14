const {Groq} = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({apiKey : process.env.GROQ_API_KEY});

async function answerQuestion(questionData){
    const chat_response = await groq.chat.completions
    .create({
        messages : [
            //TODO add system instructions here 
            {
                role : "system",
                content : "only answer according to the instructions"
            },

            {
                role: "user",
                content : JSON.stringify(questionData)
            }
        ],
        model : "llama3-70b-8192",
        temperature : 0,
        //forces response to JSON structure
        // response_format : {"type" : "json_object"}
    });

    //return answer
    //! even tho response is json structured it breaks if not parsed
    return (JSON.parse(chat_response.choices[0]?.message?.content) || "") 
}


module.exports = {answerQuestion};