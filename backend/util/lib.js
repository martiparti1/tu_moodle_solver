function delay(ms){
    return new Promise(function(resolve){
        setTimeout(resolve, ms)
    })
}

async function start_auth(page, quiz_pass){
    await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})
    await page.click("div.singlebutton.quizstartbuttondiv");

    try{
        await page.waitForSelector('input#id_submitbutton[type="submit"]', {timeout: 2000})
        const pass_field = await page.$('input#id_quizpassword[type="password"]');
        if(pass_field) await page.type('input#id_quizpassword[type="password"]', quiz_pass)

        await delay(300)
        page.click('input#id_submitbutton[type="submit"]')

        console.log("auth filled // quiz starting")
    }catch{ console.log("no auth // quizz starting") }
}









async function moodle_login(username, password, page){
    page.waitForNavigation({waitUntil: "networkidle0"})
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


async function quizAuth(page,password){
    try{
        await page.waitForSelector('input#id_submitbutton[type="submit"]', {timeout : 1500});

        const pwField = await page.$('input#id_quizpassword[type="password"]')
        if(pwField) await page.type('input#id_quizpassword[type="password"]', password)

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('input#id_submitbutton[type="submit"]')
        ])
    }catch{}
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

    //? check question for image content
    if( await page.evaluate(() => { return !!document.querySelector('.qtext img')}) ){
        const imageData = await page.evaluate(async () => {
            const imgElement = document.querySelector('.qtext img');

            const url = imgElement.getAttribute('src');
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({
                        url: url,
                        base64: reader.result
                    });
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                return { url: url, base64: null };
            }
        });

        if (imageData) questionData['img_base64'] = imageData.base64;
    }

    questionData = await handleQuestionType(page, questionData);

    if(questionData['questionType'] == 'single choice' || questionData['questionType'] == 'multiple choice'){

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

    if(questionData['questionType'] == 'text+select'){
       questionData['units'] =  await page.$$eval('.answer > select option', opts => opts.map(opt => opt.value).filter( opt => opt !== ''));
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
                //yet to do :(
            },

            "text" : () => { 
                const input = answer_field.querySelector('input[type="text"]');
                input.value = ans.answer_text;
                input.dispatchEvent(new Event('input', {bubbles : true}))
            },

            "text+select" : () => {
                const input_text = answer_field.querySelector('input[type="text"]');
                const input_select = answer_field.querySelector('select');

                input_text.value = ans.answer_text;
                input_text.dispatchEvent(new Event('input', {bubbles : true}))

                input_select.value = ans.answer_unit;
                input_select.dispatchEvent(new Event('change', {bubbles : true}))
            },
        }

        //call  required handler
        const handler = handlers[qType];
        if(handler) handler(); 

    }, answer, qType)

    qCount++;
    
    //? wait 0.3s and then go to next question
    await delay(300)
    await page.waitForSelector('div.submitbtns > input#mod_quiz-next-nav[type="submit"]')
    await page.click('div.submitbtns > input#mod_quiz-next-nav[type="submit"]');
    
}


async function handleQuestionType(page, questionData){

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
            questionData['handleQuestion'] = 'this is an open asnwer question where a text / number answer is required WITHOUT the measurement unit. when answering if only give the end result in the jJSON. if the result is integer put it as integer. if its a decimal number put it as decimal with %.2f AND ROUND MATHEMATICALLY do NOT give the measuring unit. ALWAYS give the final number of the calculation.  answer in the following format {"answer_text" : (put the answer here)}.'
            break;

        case "text+select" : 
            questionData['handleQuestion'] = 'this is an open asnwer question where a text / number answer is required WITH the measurement unit. when answering for the measurement units you can use those listed in the array in the "units" key of this JSON. should the result be an integer, give an integer. if double give it in %.2f AND ROUND MATHEMATICALLY . ALWAYS give the final number of the calculation. answer in the following JSON format {"answer_text" : (put only the number / text part of the answer here), answer_unit : (put the unit here)}'
            break;

        case "multiple choice" :
            questionData['handleQuestion'] = 'this is a question with multiple possible answers. answer only with the indexes of the right answers in the following JSON format {"answers_arr" : [(put indexes here)]}'
            break;
    }
        
    
    /* //  --OLD-- logic for if we can't process images
    if(question_hasImage) questionData['handleQuestion'] = 'the original question has an image attached to it but you do not have access to it. come up with an answer that would be the best for the question according to the question text. ' + questionData["handleQuestion"];
    */
    return questionData;
}

module.exports = {delay, getQuestionData, moodle_login, submitQuestion, quizAuth, start_auth}