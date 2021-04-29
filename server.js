const strapi = require('strapi');
strapi({
    dir: __dirname + '/'
}).start().then(()=>{
    console.log("STARTED")
}).catch(()=>{
    console.log("SOMETHING WAS WRONG")
    console.log("--Check Logs---")
})