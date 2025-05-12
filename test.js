const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, getQuestionData, moodle_login} = require('./lib.js');
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

  await page.goto('https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=361', {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  let login = await moodle_login(process.env.MOODLE_USERNAME ,  process.env.MOODLE_PASSWORD , page);
  console.log(`${login}\n`)
  await delay(1000)

  await page.waitForSelector("div.singlebutton.quizstartbuttondiv")
  await page.click("div.singlebutton.quizstartbuttondiv")
  await delay(1000)

  // await page.waitForSelector('input#id_cancel[type="submit"][value="Отказване"]')
  // await page.click('input#id_cancel[type="submit"][value="Отказване"]')


  //quiz auth --- ONLY REQUIRED FOR THE EXAMPLE QUIZ
  // await page.waitForSelector(`input#id_quizpassword[type="password"]`)
  // await page.type(`input#id_quizpassword[type="password"]`, "123456")
  // console.log("quiz password filled\n")

  //quiz start
  // await page.waitForSelector(`input#id_submitbutton[type="submit"]`)
  // await page.click(`input#id_submitbutton[type="submit"]`)
  // console.log("quiz started\n")
  // await delay(1000)


  let qCount = 1;

  //testing one here
  // page.on("load", async function handleLoad(){
    console.log("page loading, waiting 1s\n")
    await delay(1000)
    
    let questionElement = await page.$('div.qtext');

    if(questionElement){
      console.log("question element found\n")
      let questionData = {};
      await getQuestionData(page, questionData);

      console.log(questionData)
    }

    else{console.log("didnt fidn question element")}
  // })



  // page.on("load", async function handleLoad(){
  //   console.log("page loading, waiting 1s\n")
  //   await delay(1000)
    
  //   let questionElement = await page.$('div.qtext');

  //   if(questionElement){
  //     console.log("question element found\n")

  //     let questionData = {};
  //     await getQuestionData(page, questionData);


  //     //handle answer for single choice question
  //       let answer_index = await answerQuestion (questionData);
  //       console.log(`index of answer : ${answer_index}\n`)

  //       await page.evaluate((index) => {
  //         let answers = document.querySelector("div.answer").children;
  //         answers[index].querySelector('input[type="radio"]').click();
  //       }, answer_index)
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

  console.log("successfully  submitted :)")



  //TESTING CURRENTLY


})();