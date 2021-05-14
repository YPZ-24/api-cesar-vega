const {pay} = require('../../../util/stripe')

module.exports = {

    async payCurso(ctx){
        /*Get data from authenticated user*/
        const {customerId} = ctx.state.user
        /*Get data from params*/
        const {id, idPaymentMethod} = ctx.params
        /*Get data from curso*/
        const {videos} = await strapi.services.cursos.findOne({id})
        let precioTotal = 0
        videos.forEach(v => {
            precioTotal += v.precio    
        });

        try{
            //Pay with stripe
            await pay({CUSTOMER_ID: customerId, AMOUNT: precioTotal, PAYMENT_METHOD_ID: idPaymentMethod})
            return {
                statusCode: 200,
                message: 'Pago existoso'
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Error al realizar el pago') 
        }
    }
};
