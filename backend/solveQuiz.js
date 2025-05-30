const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, quizAuth} = require('./util/lib.js');
const  {answerQuestion} = require('./util/groq.js');

async function solveQuiz(quiz_url){
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    defaultViewport : null,
  });
  const page = await browser.newPage();

  await page.goto(quiz_url, {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  let login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)

  await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})
  await page.click("div.singlebutton.quizstartbuttondiv");
  console.log("quiz start button clicked")

  await quizAuth(page, '123456');

  while(true){
    console.log("WAITING FOR DELAY OF 300MS TO FINISH");
    
    await delay(300)

    let questionElement = await page.$('div.qtext');
    if(!questionElement) break;

    let questionData = {};
    await getQuestionData(page, questionData);

    let answer = await answerQuestion(questionData);
    await delay(400)
    await submitQuestion(page, answer, questionData['questionType'])

    //*DEBUGGERINGS
    let {img_base64, ...qDataExtract} = questionData
    console.log('-------------QUESTION DATA---------------')
    console.log(qDataExtract)
    console.log('-------------QUESTION DATA---------------\n')


    console.log('-------------ANSWER FROM AI---------------')
    console.log(answer)
    console.log('-------------ANSWER FROM AI---------------\n')

    //*DEBUGGERINGS    
  }
  console.log("NO MORE QUESTIONS --> SUBMITTING NOW\n")

      
  const first_submit_btn = 'button.btn-primary[type="submit"]'

  await page.waitForSelector(first_submit_btn)
  await page.click(first_submit_btn)

  await delay(500)

  const second_submit_btn = 'button.btn-primary[type="button"][data-action="save"]'

  await page.waitForSelector(second_submit_btn)
  await page.click(second_submit_btn)

  console.log("SUBMITTED // CLOSING BROWSER")
  await browser.close();
}
module.exports = {solveQuiz}
