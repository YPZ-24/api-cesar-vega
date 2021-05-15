'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
    lifecycles: {
        async beforeCreate(data) {
            const devices = await strapi.query('dispositivos').model.find({},{token: 1, _id: 0})
            const tokens = devices.map((d)=>d.token)
            await sendNotificationByTokens({title:'Nuevo Seguro Disponible...!', body:data.nombre, tokens:tokens})
        },
    },
};
