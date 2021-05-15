const {sendNotificationByTokens} = require('../../../util/firebase')

module.exports = {
    lifecycles: {
        async afterCreate(data) {
            const devices = await strapi.query('dispositivos').model.find({},{token: 1, _id: 0})
            const tokens = devices.map((d)=>d.token)
            await sendNotificationByTokens({title:'Nueva Inversión Disponible...!', body:data.nombre, tokens:tokens})
        },
    },
};
