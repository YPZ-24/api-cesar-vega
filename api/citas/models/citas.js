const {sendEmail} = require('../../../util/mailer')

module.exports = {
    lifecycles: {
        async beforeUpdate(params, data) {
            if(data._id){
                const {enlace: oldLink} = await strapi.services.citas.findOne({id: data._id}, )
                const {enlace: newLink, asunto, usuario: idUser} = data
                if(oldLink!==newLink){
                    const {email} = await strapi.query('user', 'users-permissions').findOne({id: idUser})
                    try{
                        await sendEmail( {
                            message: `${asunto}, Link para sesión actualizado: ${newLink}`, 
                            receiver: email, 
                            subject: "CESAR VEGA | ASESORIA" 
                        })
                    }catch(error){
                        throw new Error(error)
                    }
                }
            }
        },
    },
};