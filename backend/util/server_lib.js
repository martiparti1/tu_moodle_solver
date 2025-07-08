const puppeteer = require('puppeteer');

let browser = null;

async function getBrowser(){
    if(!browser){
        browser = await puppeteer.launch({
            headless : false,
            // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            defaultViewport : null
        })
    }
    return browser;
}

module.exports = { getBrowser };