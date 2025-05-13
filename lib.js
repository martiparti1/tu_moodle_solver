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
        return "LOGIN SUCCESSFUL"
    } catch(err){
        return `LOGIN ISSUES + ${err}`
    }

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
    await delay(1000)

    // check if the question has an image it uses
    const question_hasImage = await page.evaluate(()=>{ return !!document.querySelector(".qtext img") })
    
    
    // determine the type of answer required
    
    questionData = await handleQuestionType(page, questionData, question_hasImage);

    if(questionData['questionType'] == 'single choice' ){

        //make sure there are no empty spaces and newlines in the answer strings so that the ai doesnt break
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

//TODO grab the units and insert them into the JSON if select is present
//functions below are only used interanally in this file

async function handleQuestionType(page, questionData, question_hasImage){
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
    await delay(1000)
    
    
    
    switch(questionData['questionType']){
        case "single choice" :
            questionData['handleQuestion'] = "this is a single choice question. answer with a json in the following format {answer_index : (put only index of answer here)}"
            break;

        case "text" : 
            questionData['handleQuestion'] = 'this is an open asnwer question where a text / number answer is required WITHOUT the measurement unit. when answering only give the end result number in the json. do NOT give the measuring unit. answer in the following format {answer_text : (put the answer here)}.'
            break;

        case "text+select" : 
            questionData['handleQuestion'] = "this is an open asnwer question where a text / number answer is required WITH the measurement unit. when answering for the measurement units you can use those listed in the array in the 'units' key of this JSON. answer in the following JSON format {answer_text : (put only the number / text part of the answer here), answer_unit : (put the unit here)}"
            break;

        case "multiple choice" :
            questionData['handleQuestion'] = "this is a question with multiple possible answers. answer only with the indexes of the right answers in the following JSON format {answers_arr : [(put indexes here)]}"
            break;
    }
        
    if(question_hasImage) questionData['handleQuestion'] = 'the original question has an image attached to it but you do not have access to it. come up with an answer that would be the best for the question according to the question text. ' + questionData['handleQuestion'];
    return questionData;
}

module.exports = {delay, getQuestionData, moodle_login}