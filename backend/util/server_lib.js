
const sanitizeHtml = require('sanitize-html');
function flag_XSS(input){
    const clean = sanitizeHtml(input);
    if(input !== clean) return {clean : false}
    else return {clean : true}
}

module.exports = {flag_XSS}