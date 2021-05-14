const {getCustomerCards, generateCustomerId} = require('../../../util/stripe')


module.exports = {

  async getPaymentMethods(ctx){
      /*Get data from authenticated user*/
      const {customerId} = ctx.state.user
      
      try{
        return await getCustomerCards({CUSTOMER_ID: customerId})
      }catch(error){
        console.log(error)
        return ctx.badImplementation('Error al obtener tarjetas guardadas') 
      }
  },

  async createCustomerId(ctx){
      /*Get data from authenticated user*/
      const {id, email} = ctx.state.user;
      try{
        //Create customerId with Stripe
        const customer = await generateCustomerId({CUSTOMER_EMAIL: email})
        //Assign customerId to user
        await strapi.query('user', 'users-permissions').update({ id }, {customerId: customer.id})
        return {
          statusCode: 200,
          message: "ClientId creado"
        }
      }catch(error){
        console.log(error)
        return ctx.badImplementation('Error al crear cliente') 
      }
  }

};