const {sendNotificationByTokens} = require('../../../util/firebase')

module.exports = {
    lifecycles: {
        async afterUpdate(data) {
            if(data.published_at){
                const devices = await strapi.query('dispositivos').model.find({},{token: 1, _id: 0})
                const tokens = devices.map((d)=>d.token)
                const title = 'Nuevo Evento Disponible...!';
                const body = data.titulo;
                const tipo = 'EVENTO';
                const relacion = data.id;
                await strapi.services.notificaciones.create({titulo:title, contenido:body, tipo, relacion})
                await sendNotificationByTokens({title, body, tokens:tokens})
            }
        },
    },
};
