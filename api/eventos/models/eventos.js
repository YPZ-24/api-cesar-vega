const {sendNotificationByTokens} = require('../../../util/firebase')

module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            const devices = await strapi.query('dispositivos').model.find({},{token: 1, _id: 0})
            const tokens = devices.map((d)=>d.token)
            await sendNotificationByTokens({title:'Nuevo Evento Disponible...!', body:data.titulo, tokens:tokens})
        },
    },
};
