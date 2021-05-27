const {pay, createPay} = require('../../../util/stripe')

module.exports = {

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
            let message = '';
            let clientSecret = ''
            //Pay with stripe
            if(idPaymentMethod) {
                await pay({CUSTOMER_ID: customerId, AMOUNT: precioTotal, PAYMENT_METHOD_ID: idPaymentMethod})
                message = 'Pago exitoso'
            }
            else {
                clientSecret = await createPay({CUSTOMER_ID: customerId, AMOUNT: precioTotal})
                message = 'Client Secret creado'
            }

            return {
                statusCode: 200,
                clientSecret: clientSecret,
                message
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Error al realizar pago')
        }
    }



};
