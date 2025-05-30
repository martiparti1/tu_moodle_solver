const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, quizAuth} = require('./util/lib.js');
const  {answerQuestion} = require('./util/groq.js');


async function solveQuiz(quiz_url){
  const browser = await puppeteer.launch({
    headless: true,
    // uncomment for debug
    // executablePath : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    // executablePath : "/usr/bin/google-chrome-stable",
    defaultViewport : null,

  });
  const page = await browser.newPage();

  await page.goto(quiz_url, {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  
  let login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)

  await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})

  //!register event before starting to prevent errors

  page.on("load",async function handleLoad(){
    console.log("page loading, waiting for networkidle0\n")    
    await delay(300)
    
    let questionElement = await page.$('div.qtext');
    if(questionElement){
      console.log("question element found, getting answer...\n")

      let questionData = {};
      await getQuestionData(page, questionData);

      let {img_base64, ...qDataExtract} = questionData
      console.log(qDataExtract);
      console.log("----------------------------------------")
      let answer = await answerQuestion(questionData);
      console.log(answer)
      console.log("----------------------------------------")

      console.log("waiting 0.4s before submitting")
      await delay(400)
      await submitQuestion(page, answer, questionData['questionType'])
    }

    else{
      console.log("no more questions :))) submitting now!! \n");
      await page.waitForSelector('button.btn-primary[type="submit"]')
      await page.click('button.btn-primary[type="submit"]')

      await delay(500)

      await page.waitForSelector('button.btn-primary[type="button"][data-action="save"]')
      await page.click('button.btn-primary[type="button"][data-action="save"]')


      console.log("SUBMITTED // CLOSING THE AI PROCESS")
      page.off("load", handleLoad);
      await browser.close();
      return;
    }
  })


  //!start the quiz
  await page.click("div.singlebutton.quizstartbuttondiv")
  console.log("quiz start button clicked")

  console.log("running quiz auth check :)")
  await quizAuth(page, "123456");

}
module.exports = {solveQuiz}