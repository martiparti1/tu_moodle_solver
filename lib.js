function delay(ms){
    return new Promise(function(resolve){
        setTimeout(resolve, ms)
    })
}

async function getQuestionData(page, questionData){
    questionData["instruction"] = "answer only with the key of the answer in the answers obj"
    await delay(1000);
    const firstQuestion = await page.evaluate(() => {

        let qText = document.querySelector("div.qtext").textContent.trim();

        if(!qText) return "problem finding question";
        else return qText;
    })

    if(firstQuestion) questionData['question'] = firstQuestion;
    else questionData['question'] = "problem finding question";
    await delay(1000)


    const questionType = await page.evaluate(() => {
        let qText = document.querySelector("div.prompt").textContent.trim();

        let ans_firstChild = document.querySelector("div.answer").firstElementChild;

        if (qAnswers.firstElementChild.querySelector('input[type="radio"]'))
            return "single choice"
        else if (qAnswers.firstChild.querySelector)

        if(qText.toLowerCase() == "изберете едно") return "single choice";
        else return "multiple choice";
    });

    if(questionType) questionData['questionType'] = questionType;
    else questionData['questionType'] = `problem finding question type ; data --> ${questionType}`;
    await delay(1000)

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

    return questionData;
}


module.exports = {delay, getQuestionData}