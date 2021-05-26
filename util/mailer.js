const {API_SES_MAILER_URL,API_SES_MAILER_KEY} = process.env
const axios = require('axios')

async function sendEmail( {message, receiver, subject }){
    try{
        await axios({
            method: 'POST',
            url: API_SES_MAILER_URL+'/api/genericMail',
            data: {
                sender: "ventas@fyf.mx",
                message: message,
                receiver: receiver,
                subject: subject,
                apiKey: API_SES_MAILER_KEY
            }        
        })
        return true
    }catch(error){
        console.log(error)
        throw new Error(error)
    }
}

module.exports = {
    sendEmail
}