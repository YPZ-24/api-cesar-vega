module.exports = {
    lifecycles: {
        async beforeUpdate(params, data) {
            if(data._id){
                const {enlace: oldLink} = await strapi.services.citas.findOne({id: data._id}, )
                const {enlace: newLink} = data
                if(oldLink!==newLink){
                    console.log("ENVIAR MENSAJE CON LINK DE LA ASESORIA")
                }
            }
        },
    },
};