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
            content : "only answer according to the instructions"
        },

        {
            role: "user",
            content : JSON.stringify(qDataText)
        }, 
    ];

    let mdl = "llama3-70b-8192"
    let temp = 0;
    let rf = {"type" : "text"}

    //alter chat params if we need to process image
    if(questionData.img_base64 != undefined){
        console.log("WE HAVE IMAGE")
        msgs[1].content = [
            { "type" : "image_url", "image_url" : { "url" : questionData.img_base64} },
            { "type" : "text", "text" : JSON.stringify(qDataText) }
        ];

        mdl = "meta-llama/llama-4-maverick-17b-128e-instruct";
        temp = 0;
        rf = {"type" : "json_object"}
    }


    console.log(`MODEL USED ${mdl}`)
    
    const chat_response = await groq.chat.completions
    .create({
        messages : msgs,
        model : mdl,
        temperature : 0.6,
        response_format : rf,

        stream : false
    });

    //return answer
    //! even tho response is json structured it breaks if not parsed
    return (JSON.parse(chat_response.choices[0]?.message?.content) || "") 
}


module.exports = {answerQuestion};