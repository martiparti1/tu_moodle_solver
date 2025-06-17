const {Groq} = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({apiKey : process.env.GROQ_API_KEY});

async function answerQuestion(questionData){

    //separate the image from the question data
    let {img_base64, ...qDataText} = questionData; 

    //predefine chat variables so that we can change before submitting
    let msgs = [
        {
            role : "system",
            content : "only answer according to the instructions and ALWAYS in JSON. wrap both key and value in quotes everytime"
        },

        {
            role: "user",
            content : JSON.stringify(qDataText)
        }, 
    ];


    //alter chat params if we need to process image
    if(questionData.img_base64 != undefined){
        console.log("WE HAVE IMAGE")
        msgs[1].content = [
            { "type" : "image_url", "image_url" : { "url" : questionData.img_base64} },
            { "type" : "text", "text" : JSON.stringify(qDataText) }
        ];
    }
    
    const chat_response = await groq.chat.completions
    .create({
        messages : msgs,
        model : "meta-llama/llama-4-maverick-17b-128e-instruct",
        temperature : 0,
        stream : false,
        response_format : {"type" : "json_object"}
        
    });

    //return answer
    //! even tho response is json structured it breaks if not parsed
    return (JSON.parse(chat_response.choices[0]?.message?.content) || "") 
}


module.exports = {answerQuestion};