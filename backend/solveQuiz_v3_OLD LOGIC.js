const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, quizAuth, start_auth} = require('./util/lib.js');
const  {answerQuestion} = require('./util/groq.js');


async function solveQuiz(quiz_url, quiz_password){
  const browser = await puppeteer.launch({
    headless: true,
    // uncomment for debug
    // executablePath : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    // executablePath : "/usr/bin/google-chrome-stable",
    defaultViewport : null,

  });
  const page = await browser.newPage();

  await page.goto(quiz_url, {waitUntil : 'networkidle0'});
  console.log("Page loaded\n");

  
  const login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)

  await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})
  
  async function handleLoad(){
    await delay(300)
    
    let questionElement = await page.$('div.qtext');
    if(questionElement){
      console.log("question element found, getting answer...\n")

      let questionData = {};
      await getQuestionData(page, questionData);
      let answer = await answerQuestion(questionData);

      

      console.log("waiting 0.4s before submitting")
      await delay(400)
      await submitQuestion(page, answer, questionData['questionType'])
    }

    else{
      console.log("no more questions :))) submitting now!! \n");

      console.log("stopping the load event");
      page.off("load", handleLoad);

      await page.waitForSelector('button.btn-primary[type="submit"]')
      await page.click('button.btn-primary[type="submit"]')
      console.log("clicked first submit // waiting for 500ms and then clicking second")
      await delay(500)

      await page.waitForSelector('button.btn-primary[type="button"][data-action="save"]')
      await page.click('button.btn-primary[type="button"][data-action="save"]')

      console.log("CLICKED SECOND SUBMIT :DDDD\n")
      await delay(400)
      console.log("SUBMITTED // CLOSING THE BROWSER")
      await browser.close();
      return;
    }
  }

  console.log("EXECUTING NEW LOGIN THAT CHECKS FOR AUTH\n");
  
  await start_auth(page, quiz_password)

  console.log("NEW AUTH FUNC COMPLETED // DOING INITIAL HANDLELOAD FUNC");
  
  await handleLoad();

  console.log("INIT HANDLELOAD DONE // PUTTING ONLOAD LISTENER");
  
  

  page.on("load", handleLoad)
}
module.exports = {solveQuiz}

// solveQuiz("https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=2681")