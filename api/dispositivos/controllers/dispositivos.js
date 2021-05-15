
module.exports = {
    async create(ctx){
        /*Get data from body*/
        const {token} = ctx.request.body;
        /*Get data from authenticated user*/
        const {id} = ctx.state.user;
        /*Validations*/
        const exists = await strapi.services.dispositivos.findOne({token, user:id}) 
        
        /*Assign and save user token*/
        if(!exists) await strapi.services.dispositivos.create({token, user:id})
        
        return {
            status: 200,
            message: "token de dispositivo guardado"
        }
    }
};
