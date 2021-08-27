const {getCustomerCards, generateCustomerId} = require('../../../util/stripe')
const GraphqlError = require('../../../util/errorHandler');
const { sendEmail } = require('../../../util/mailer');

module.exports = {

  async getProfile(ctx){
    const {id} = ctx.params
    const user = await strapi.query('user', 'users-permissions').findOne({ id })
    if(!user){
      return new GraphqlError("Usuario no encontrado",400) 
    }else{
      const {username, email, edad, fechaNacimiento, telefono, saldo, imagenPerfil, emailConfirmed} = user
      return {
        username,
        email,
        edad,
        fechaNacimiento,
        telefono,
        saldo,
        imagenPerfil,
        emailConfirmed
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

  async addCurso(ctx){
    /*Get data from authenticated user*/
    const {id, cursos, cursos: userCourses} = ctx.state.user;
    const {idCurso} = ctx.params;
    //Validations
    const course = await strapi.services.cursos.findOne({id: idCurso})
    if(!course) return new GraphqlError("El curso no existe", 400)
    let exists = false;
    userCourses.forEach( (uc) => (uc.toString()===idCurso) ? exists = true : exists )
    if(exists) return new GraphqlError("El curso ya es tuyo", 400)

    await strapi.query('user', 'users-permissions').update({ id }, {cursos: [...cursos, idCurso]})
    return{
      statusCode: 200,
      message: "Ahora eres dueño de este curso"
    }
  },

  async sendEmailConfirmation(ctx){
    const {id:idUser, email} = ctx.state.user
    const urlConfirmation = `https://cesarvega.com.mx/user/${idUser}/email/confirm`
    const msj =     `<p>Hola...!</p>
                      Confirma tu correo entrando al siguiente enlace: 
                      ${urlConfirmation}
                    `         
    try{

      await sendEmail( {
        message: msj, 
        receiver: email, 
        subject: "Cesar Vega | Asesoría" 
      })

      return{
        statusCode: 200,
        message: "Revisa tu correo electronico"
      }

    }catch(e){
      console.log(e)
      return new GraphqlError('Ocurrio un error al enviar correo', 500) 
    }  

  },

  async confirmEmail(ctx){
    const userId = ctx.params.id
    let response;
    try{
      await strapi.query('user', 'users-permissions').update({ id: userId }, {emailConfirmed: true, confirmed: true})
      response = "Tu correo electronico fue confirmado"
    }catch(e){
      console.log(e)
      response = "Algo paso, vuelve a intentarlo"
    }finally{
      return response
    }
  }

};