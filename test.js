const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, quizAuth} = require('./lib.js');
const  {answerQuestion} = require('./groq.js');


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // uncomment if you have unusual chrome install / want to use a different browser
    executablePath : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    // executablePath : "/usr/bin/google-chrome-stable",
    defaultViewport : null,

  });
  const page = await browser.newPage();

  await page.goto('https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=2629', {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  let login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)


  console.log("running quiz auth check :)")
  // await delay(3000)
  await quizAuth(page);

  await page.waitForSelector("div.singlebutton.quizstartbuttondiv", {timeout : 3000})
  await page.click("div.singlebutton.quizstartbuttondiv")
  console.log("quiz start button clicked")
  
  // await delay(1000)

  // await page.waitForSelector('input#id_cancel[type="submit"][value="Отказване"]')
  // await page.click('input#id_cancel[type="submit"][value="Отказване"]')


  
  

  //! calling delay function before load event prevents it from happening

  page.on("load",async function handleLoad(){
    console.log("page loading, waiting 0.3s\n")
    await delay(300)
    
    let questionElement = await page.$('div.qtext');
    //? if we have a question on page solve and go next
    if(questionElement){
      console.log("question element found, getting answer...\n")

      //put all question data in json
      let questionData = {};
      await getQuestionData(page, questionData);

      //pass answer and question type to submit function
      let answer = await answerQuestion(questionData);
      let qType  = questionData['questionType'];
      // console.log(questionData);
      // console.log(answer)
      // console.log(`qType is ${qType}`)

      submitQuestion(page, answer, qType)
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



  // page.on("load", async function handleLoad(){
  //   console.log("page loading, waiting 1s\n")
  //   await delay(1000)
    
  //   let questionElement = await page.$('div.qtext');

  //   if(questionElement){
  //     console.log("question element found\n")

  //     let questionData = {};
  //     await getQuestionData(page, questionData);


  //     //handle answer for single choice question
  //       let correct = await answerQuestion (questionData);

  //       await page.evaluate((index) => {
  //         let answers = document.querySelector("div.answer").children;
  //         answers[index].querySelector('input[type="radio"]').click();
  //       }, correct)
  //     //ends here

  //     console.log(`for question ${qCount} clicked on answer ${answer_index} \nwaiting 1s `)
  //     qCount++;

  //     await delay(1000)
  //     await page.waitForSelector('div.submitbtns > input#mod_quiz-next-nav[type="submit"]')
  //     await page.click('div.submitbtns > input#mod_quiz-next-nav[type="submit"]');

  //   }

  //   else{
  //     console.log("no more questions :) \nsubmitting now!");
  //     await page.waitForSelector('button.btn-primary[type="submit"]')
  //     await page.click('button.btn-primary[type="submit"]')

  //     await delay(500)

  //     await page.waitForSelector('button.btn-primary[type="button"][data-action="save"]')


  //     await page.click('button.btn-primary[type="button"][data-action="save"]')

  //     page.off("load", handleLoad);
  //     return;
  //   }
  // })




  //TESTING CURRENTLY


})();