const {sendNotificationByTokens} = require('../../../util/firebase')

module.exports = {
    lifecycles: {
        /*
        async afterUpdate(result, params, data) {
            if(data.published_at){
                const devices = await strapi.query('dispositivos').model.find({},{token: 1, _id: 0})
                const tokens = devices.map((d)=>d.token)
                const title = "Nuevo Curso Disponible...!";
                const body = result.nombre;
                const tipo = 'CURSO';
                const relacion = result.id;
                await strapi.services.notificaciones.create({titulo:title, contenido:body, tipo, relacion})
                await sendNotificationByTokens({title, body, tokens:tokens})
            }
        },*/
    },
};
