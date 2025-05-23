const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, quizAuth} = require('./lib.js');
const  {answerQuestion} = require('./groq.js');


(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    // uncomment if you have unusual chrome install / want to use a different browser
    // executablePath : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    // executablePath : "/usr/bin/google-chrome-stable",
    defaultViewport : null,

  });
  const page = await browser.newPage();

  await page.goto('https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=361', {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  let login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)


  

  await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})
  await page.click("div.singlebutton.quizstartbuttondiv")
  console.log("quiz start button clicked")

  console.log("running quiz auth check :)")
  await quizAuth(page, "123456");

  
  //! calling delay function before load event prevents it from happening

  page.on("load",async function handleLoad(){
    console.log("page loading, waiting 0.3s\n")
    await delay(300)
    
    let questionElement = await page.$('div.qtext');
    //? if we have a question on page solve and go next
    if(questionElement){
      console.log("question element found, getting answer...\n")

      //? put all question data in json
      let questionData = {};
      await getQuestionData(page, questionData);
      
      //? pass answer and question type to submit function

      let {img_base64, ...qDataExtract} = questionData
      console.log(qDataExtract);
      console.log("----------------------------------------")
      let answer = await answerQuestion(questionData);
      // let qType  = 
      console.log(answer)
      console.log("----------------------------------------")

      console.log("waiting 0.4s before submitting")
      await delay(400)
      submitQuestion(page, answer, questionData['questionType'])
    }

    else{
      console.log("no more questions :))) submitting now!! \n");
      await page.waitForSelector('button.btn-primary[type="submit"]')
      await page.click('button.btn-primary[type="submit"]')

      await delay(500)

      await page.waitForSelector('button.btn-primary[type="button"][data-action="save"]')
      await page.click('button.btn-primary[type="button"][data-action="save"]')

      page.off("load", handleLoad);
      return;
    }
  })

})();