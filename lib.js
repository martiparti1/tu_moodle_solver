function delay(ms){
    return new Promise(function(resolve){
        setTimeout(resolve, ms)
    })
}

async function moodle_login(username, password, page){
    await page.waitForSelector(`input[type="text"]#username`);
    await page.type(`input[type="text"]#username`, username);
    await page.waitForSelector(`input[type="password"]#password`);
    await page.type(`input[type="password"]#password`, password);
    await page.waitForSelector(`.btn-primary#loginbtn`)
    await page.click(`.btn-primary#loginbtn`)

    try{
        await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})
        return "LOGIN SUCCESSFUL,  WAITING FOR 1s"
    } catch(err){
        return `LOGIN ISSUES + ${err}`
    }

}

async function quizAuth(page){
    let hasAuth = true
    try{
      await page.waitForSelector(`input#id_quizpassword[type="password"]`, {timeout: 1000})
    }
    catch{
      hasAuth = false;
    }
  
    if(hasAuth){
      await page.type(`input#id_quizpassword[type="password"]`, "123456")
      console.log("quiz password filled\n")
      await page.waitForSelector(`input#id_submitbutton[type="submit"]`)
      await page.click(`input#id_submitbutton[type="submit"]`)
      console.log("quiz started\n")
    }
  
    else console.log("no auth, proceding as usual")
}

async function getQuestionData(page, questionData){

    questionData['instructions'] = "In this JSON-like string is a question from a quiz. You are to answer it according to the instructions in the handleQuestion key. Answer in a JSON format according to the specific instructions."
    
    //! get the question text
    await delay(500);
    const questionText = await page.evaluate(() => {

        let qText = document.querySelector("div.qtext").textContent.replace(/\n/g, ' ').trim();

        if(!qText) return "problem finding question";
        else return qText;
    })

    if(questionText) questionData['question'] = questionText;
    else questionData['question'] = "problem finding question";
    // await delay(1000)

    // check if the question has an image it uses
    const question_hasImage = await page.evaluate(()=>{ return !!document.querySelector(".qtext img") })
    
    
    // determine the type of answer required
    
    questionData = await handleQuestionType(page, questionData, question_hasImage);

    //for question where the answers include text ; make sure one answer = one string so that ai doesnt break
    if(questionData['questionType'] == 'single choice' ){

        const answers_json = await page.evaluate(() => {
            let answers_obj = {};

            const answerDivs = document.querySelectorAll('.answer > *');
            answerDivs.forEach((answer, index) => {
                answers_obj[index] = answer.textContent.replace(/\n/g, ' ').trim()
            })

            return answers_obj;
        })
        
        if (answers_json) questionData['answers'] = answers_json;
        else questionData['answers'] = `problem finding answers; data --> ${answers_json}`;
    }

    return questionData;
}

async function submitQuestion(page, answer, qType){

    let qCount = 1;

    //inputting the correct answer
    await page.evaluate((ans,qType) => {

        //get the field where we input answer
        const answer_field = document.querySelector('.answer');        
        if (!answer_field) return "ERROR : NO ANSWER FIELD"        

        //handle answer input logic based on question type
        const handlers = {
            "single choice" : () => { answer_field.children[ans.answer_index].querySelector('input[type="radio"]').click() },

            "multiple choice" : () => {

            },

            "text" : () => { 
                const input = answer_field.querySelector('input[type="text"]');
                input.value = ans.answer_text;
                input.dispatchEvent(new Event('input', {bubbles : true}))
            },

            "text+select" : () => {

            },
        }

        //call  required handler
        const handler = handlers[qType];
        if(handler) handler(); 

    }, answer, qType)

    qCount++;
    
    await delay(300)
    await page.waitForSelector('div.submitbtns > input#mod_quiz-next-nav[type="submit"]')
    await page.click('div.submitbtns > input#mod_quiz-next-nav[type="submit"]');
    
}

//TODO grab the units and insert them into the JSON if select is present

//!functions below are only used interanally in this file

async function handleQuestionType(page, questionData, question_hasImage){

    //decide based on the contenets of .answer div
    const questionType = await page.evaluate(() => {
        let ans_div = document.querySelector(".answer");
        let ans_firstChild = ans_div.firstElementChild;

        if(ans_firstChild.querySelector('input[type="radio"]')) return "single choice"

        else if(ans_firstChild.querySelector('input[type="checkbox')) return "multiple choice"

        else if(ans_div.querySelector('input[type="text"]')){
            if(ans_div.querySelector('select')) return "text+select"
            else return "text"
        }
    });

    if(questionType) questionData['questionType'] = questionType;
    else questionData['questionType'] = `problem finding question type ; data --> ${questionType}`;
    // await delay(1000)
    
    
    //depending on question type put set instructions
    switch(questionData['questionType']){
        case "single choice" :
            questionData['handleQuestion'] = 'this is a single choice question. answer with a json in the following format {answer_index : (put only index of answer here)}'
            break;

        case "text" : 
            questionData['handleQuestion'] = 'this is an open asnwer question where a text / number answer is required WITHOUT the measurement unit. when answering if only give the end result in the jJSON. if the result is integer put it as integer. if its a decimal number put it as decimal with %.2f do NOT give the measuring unit.  answer in the following format {"answer_text" : (put the answer here)}.'
            break;

        case "text+select" : 
            questionData['handleQuestion'] = 'this is an open asnwer question where a text / number answer is required WITH the measurement unit. when answering for the measurement units you can use those listed in the array in the "units" key of this JSON. should the result be an integer, give an integer. if double give it in %.2f.  answer in the following JSON format {"answer_text" : (put only the number / text part of the answer here), answer_unit : (put the unit here)}'
            break;

        case "multiple choice" :
            questionData['handleQuestion'] = 'this is a question with multiple possible answers. answer only with the indexes of the right answers in the following JSON format {"answers_arr" : [(put indexes here)]}'
            break;
    }
        
    if(question_hasImage) questionData['handleQuestion'] = 'the original question has an image attached to it but you do not have access to it. come up with an answer that would be the best for the question according to the question text. ' + questionData["handleQuestion"];
    return questionData;
}

module.exports = {delay, getQuestionData, moodle_login, submitQuestion, quizAuth}