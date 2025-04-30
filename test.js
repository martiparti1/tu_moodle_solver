const puppeteer = require('puppeteer');
require('dotenv').config();
const  {delay, getQuestionData} = require('./lib.js');
const  {answerQuestion} = require('./groq.js');


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath : "/usr/bin/google-chrome-stable",
    defaultViewport : null,

});


    
  
    const page = await browser.newPage();

    await page.goto('https://mdl.fcst.tu-sofia.bg/mod/quiz/view.php?id=361', {waitUntil : 'networkidle2'});

    console.log("Page loaded\n");

    
    await page.waitForSelector(`input[type="text"]#username`);
    await page.type(`input[type="text"]#username`, process.env.MOODLE_USERNAME);
    await page.waitForSelector(`input[type="password"]#password`);
    await page.type(`input[type="password"]#password`, process.env.MOODLE_PASSWORD);
    await page.waitForSelector(`.btn-primary#loginbtn`)
    await page.click(`.btn-primary#loginbtn`)
    console.log("logged in\n");
    await delay(1000)

    await page.waitForSelector("div.singlebutton.quizstartbuttondiv")
    await page.click("div.singlebutton.quizstartbuttondiv")
    await delay(1000)

    // await page.waitForSelector('input#id_cancel[type="submit"][value="Отказване"]')
    // await page.click('input#id_cancel[type="submit"][value="Отказване"]')


    //quiz auth
    await page.waitForSelector(`input#id_quizpassword[type="password"]`)
    await page.type(`input#id_quizpassword[type="password"]`, "123456")
    console.log("quiz password filled\n")

    //quiz start
    await page.waitForSelector(`input#id_submitbutton[type="submit"]`)
    await page.click(`input#id_submitbutton[type="submit"]`)
    console.log("quiz started, giving 2 seconds delay\n")
    await delay(2000)

    // await page.waitForNavigation({waitUntil : 'networkidle2'});
    // await delay(1000)

    let questionData = {};
    await getQuestionData(page, questionData);
    await answerQuestion (questionData);
    // console.log("question data: ", questionData);

})();