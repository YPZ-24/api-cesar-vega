const {pay, createPay} = require('../../../util/stripe')

module.exports = {

    async createPayCurso(ctx){
        /*Get data from authenticated user*/
        const {id: idUser} = ctx.state.user
        const {customerId} = await strapi.query('user', 'users-permissions').findOne({ id: idUser })
        /*Get data from params*/
        const {id} = ctx.params
        /*Get data from curso*/
        const {videos} = await strapi.services.cursos.findOne({id})
        let precioTotal = 0
        videos.forEach(v => {
            precioTotal += v.precio    
        });
        try{
            //Pay with stripe
            const clientSecret = await createPay({CUSTOMER_ID: customerId, AMOUNT: precioTotal})
            return {
                statusCode: 200,
                clientSecret
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Error al crear pago')
        }
    },

    async payCurso(ctx){
        /*Get data from authenticated user*/
        const {id: idUser} = ctx.state.user
        const {customerId} = await strapi.query('user', 'users-permissions').findOne({ id: idUser })
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
            return ctx.badImplementation('Error al realizar pago')
        }
    }



};
