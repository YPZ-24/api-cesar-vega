const {getCustomerCards, generateCustomerId} = require('../../../util/stripe')
const GraphqlError = require('../../../util/errorHandler');

module.exports = {

  async getProfile(ctx){
    const {id} = ctx.params
    const user = await strapi.query('user', 'users-permissions').findOne({ id })
    console.log(user.imagenPerfil)
    if(!user){
      return new GraphqlError("Usuario no encontrado",400) 
    }else{
      const {username, email, edad, fechaNacimiento, telefono, saldo, imagenPerfil} = user
      return {
        username,
        email,
        edad,
        fechaNacimiento,
        telefono,
        saldo,
        imagenPerfil,
      }
    }
  },

  async createUserRefered(ctx){
    await strapi.plugins['users-permissions'].controllers.auth.register(ctx);
    const user = await strapi.query('user', 'users-permissions').update({ email: ctx.request.body.email }, {blocked: true, cliente: true})
    return user;
  },

  async createUserGeneric(ctx){
    return await strapi.plugins['users-permissions'].controllers.auth.register(ctx);
  },

  async getPaymentMethods(ctx){
      /*Get data from authenticated user*/
      const {customerId} = ctx.state.user
      
      try{
        const cards =  await getCustomerCards({CUSTOMER_ID: customerId})
        return{
          statusCode: 200,
          cards
        }
      }catch(error){
        console.log(error)
        return new GraphqlError("Error al obtener tarjetas guardadas",500) 
      }
  },

  async createCustomerId(ctx){
      /*Get data from authenticated user*/
      const {id, email} = ctx.state.user;
      try{
        const {customerId} = await strapi.query('user', 'users-permissions').findOne({ id })
        if(customerId) return new GraphqlError("CustomId ya existe", 400)

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
        return new GraphqlError("Error al crear cliente", 500) 
      }
  },

};