const {pay, createPay} = require('../../../util/stripe')
const GraphqlError = require('../../../util/errorHandler')

module.exports = {

    async canPayCursoWithSaldo(ctx){
        /*Get data from authenticated user*/
        const {saldo} = ctx.state.user
        /*Get data from params*/
        const {id} = ctx.params
        //Validations
        const course = await strapi.services.cursos.findOne({id})
        if(!course) return new GraphqlError("El curso no existe", 400)
        
        const {videos} = course;
        let precioTotal = 0
        videos.forEach(v => {
            precioTotal += v.precio    
        });
        const can = (saldo>=precioTotal) ? true : false
        return {
            statusCode: 200,
            can,
            total: precioTotal,
            message: can ? "Tienes suficiente saldo" : "No tienes suficiente saldo"
        }
    },

    async payCursoWithSaldo(ctx){
        /*Get data from authenticated user*/
        const {saldo, id: idUser, cursos: userCourses} = ctx.state.user
        /*Get data from params*/
        const {id} = ctx.params
        //Validations
        const course = await strapi.services.cursos.findOne({id})
        if(!course) return new GraphqlError("El curso no existe", 400)
        let exists = false;
        userCourses.forEach( (uc) => (uc.toString()===id) ? exists = true : exists )
        if(exists) return new GraphqlError("El curso ya es tuyo", 400)

        const {videos} = course;
        let precioTotal = 0
        videos.forEach(v => {
            precioTotal += v.precio    
        });
        const can = (saldo>=precioTotal) ? true : false
        if(can){
            await strapi.query('user', 'users-permissions').update({id: idUser},{ saldo: saldo - precioTotal })
            return {
                statusCode: 200,
                message: 'Pago exitoso'
            }
        }else{
            return new GraphqlError('No tienes suficiente saldo', 400) 
        }
    },

    async payCurso(ctx){
        /*Get data from authenticated user*/
        const {id: idUser, customerId, cursos: userCourses} = ctx.state.user
        /*Get data from params*/
        let {id, idPaymentMethod} = ctx.params
        //Validations
        const course = await strapi.services.cursos.findOne({id})
        if(!course) return new GraphqlError("El curso no existe", 400)
        let exists = false;
        userCourses.forEach( (uc) => (uc.toString()===id) ? exists = true : exists )
        if(exists) return new GraphqlError("El curso ya es tuyo", 400)
        if(!customerId) return new GraphqlError("No tienes clave para pagar", 500)
        
        const {videos} = course;
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
            return new GraphqlError("Error al realizar pago", 500) 
        }
    }

};
