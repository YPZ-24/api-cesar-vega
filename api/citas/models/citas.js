module.exports = {
    lifecycles: {
        async beforeUpdate(params, data) {
            //data.email = 'Some fixed name';
            const {enlace: oldLink} = await strapi.services.citas.findOne({id: data._id}, )
            const {enlace: newLink} = data
            if(oldLink!==newLink){
                console.log("ENVIAR MENSAJE CON LINK DE LA ASESORIA")
            }
        },
    },
};