const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, moodle_login, getQuestionData, submitQuestion, start_auth} = require('./util/solver_lib.js');
const  {answerQuestion} = require('./util/groq.js');
const {getBrowser} = require('./util/server_lib.js');

async function solveQuiz(quiz_url, quiz_password, user_email, user_password){
  const browser = await getBrowser();
  // const browser = await puppeteer.launch({
  //             headless : false,
  //             executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  //             defaultViewport : null
  //         })
  // const context = await browser.createIncognitoBrowserContext();
  const page = await browser.newPage();

  await page.goto(quiz_url, {waitUntil : 'networkidle2'});
  console.log("Page loaded\n");

  let login = await moodle_login(user_email,  user_password, page);
  console.log(`${login}\n`)
  await delay(1000)

  await start_auth(page, quiz_password)

  while(true){

    try{ 
      //wait for document to be ready AND give .3s buffer to prevent loading fuckups
      await page.waitForFunction(() => document.readyState === 'complete');
      await delay(300);
      await page.waitForSelector('.qtext', {timeout : 5000, visible : true})
    } catch(err){

      if(err.name == "TimeoutError"){
        console.log("No question found ;; going to submit now!!!!!");
        break;
      }
      else{ 
        console.log(err)
        break;
      } 

    }
    let questionData = {};
    await getQuestionData(page, questionData);

    let {img_base64, ...realShit} = questionData;
    console.log('-----------Q DATA OBJ--------------')
    console.log(realShit);
    console.log('-----------Q DATA OBJ--------------')




    let answer = await answerQuestion(questionData);

    console.log('-----------ANSWER--------------')
    console.log(answer);
    console.log('-----------ANSWER--------------')

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
  await page.close();
  await browser.close();
}
module.exports = {solveQuiz}


// solveQuiz("https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=2629", '')
// solveQuiz('https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=2629', '', 'martinrpetrov' , 'martinpetrovTU7!')