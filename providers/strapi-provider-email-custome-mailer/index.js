const {API_SES_MAILER_URL,API_SES_MAILER_KEY} = process.env
const axios = require('axios')

module.exports = {
    init: (providerOptions = {}, settings = {}) => {
        return {
            send: async options => {
                const {to, subject, text} = options
                console.log(text)
                /*
                try{
                    await axios({
                        method: 'POST',
                        url: API_SES_MAILER_URL+'/api/genericMail',
                        data: {
                            sender: "ventas@fyf.mx",
                            message: text,
                            receiver: to,
                            subject: subject,
                            apiKey: API_SES_MAILER_KEY
                        }        
                    })
                    return true
                }catch(error){
                    console.log(error)
                    throw new Error(error)
                }*/

            },
        };
    },
};