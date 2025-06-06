const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, start_auth} = require('./util/solver_lib.js');
const  {answerQuestion} = require('./util/groq.js');

async function solveQuiz(quiz_url, quiz_password){
  const browser = await puppeteer.launch({
    headless: true,
    // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    defaultViewport : null,
  });
  const page = await browser.newPage();

  await page.goto(quiz_url, {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  let login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)

  await start_auth(page, quiz_password)

  while(true){
    try{ 
      await page.waitForSelector('div.qtext', {timeout : 3000})
    } catch (err) { 
      console.log(err)
      break; 
    }

    let questionData = {};
    await getQuestionData(page, questionData);

    let answer = await answerQuestion(questionData);
    await delay(400)
    await submitQuestion(page, answer, questionData['questionType']) 
  }

  console.log("NO MORE QUESTIONS --> SUBMITTING NOW\n")

  await page.waitForSelector('button.btn-primary[type="submit"]')
  await page.click('button.btn-primary[type="submit"]')
  console.log("clicked first submit // waiting 3s before clicking second")
  await delay(3000)


  await page.waitForSelector('button.btn-primary[type="button"][data-action="save"]')
  await page.click('button.btn-primary[type="button"][data-action="save"]')

  console.log("CLICKED SECOND SUBMIT BUTTON // CLOSING BROWSER")
  await browser.close();
}
module.exports = {solveQuiz}
