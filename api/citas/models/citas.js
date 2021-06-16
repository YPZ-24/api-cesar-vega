const {sendEmail} = require('../../../util/mailer')

module.exports = {
    lifecycles: {
        async beforeUpdate(params, data) {
            if(data._id){
                const {enlace: oldLink} = await strapi.services.citas.findOne({id: data._id}, )
                const {enlace: newLink, asunto, usuario: idUser, fecha} = data
                if(oldLink!==newLink){
                    const {email} = await strapi.query('user', 'users-permissions').findOne({id: idUser})
                    try{
                        const fechaFormatted = fecha.toLocaleString('es-MX')
                        const msj =     `<p>Gracias por agendar una cita, Actualización!</p>
                                        Asunto: ${asunto}<br/>
                                        Fecha: ${fechaFormatted}<br/>
                                        Enlace Actualizado: ${newLink}<br/>
                                        `        
                        await sendEmail( {
                            message: msj, 
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