const {getCustomerCards, generateCustomerId} = require('../../../util/stripe')
const GraphqlError = require('../../../util/errorHandler');
const { sendEmail } = require('../../../util/mailer');
const { default: axios } = require('axios');

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
    try{
      const {email, username} = ctx.request.body

      let user = await strapi.query('user', 'users-permissions').findOne(  {
        _where: {email}
      } )
      
      if(user) return new GraphqlError("Ya hay un usuario con ese correo",400)

      await strapi.plugins['users-permissions'].controllers.auth.register(ctx);
      user = await strapi.query('user', 'users-permissions').update({ email: ctx.request.body.email }, {blocked: true, cliente: true})
      return user;
    }catch(e){
      console.log(e)
      return new GraphqlError("Ocurrio un error",500) 
    }
    
  },

  async createUserGeneric(ctx){
    try{
      const {email} = ctx.request.body

      /* Validate if email already exists */
      const user = await strapi.query('user', 'users-permissions').findOne(  {
        _where: {email}
      } )

      if(user) return new GraphqlError("Ya hay un usuario con ese correo",400) 
      
      return await strapi.plugins['users-permissions'].controllers.auth.register(ctx);
    }catch(e){
      console.log(e)
      return new GraphqlError("Ocurrio un error",500) 
    }
  },

  async userExistsWithEmail(ctx){
    try{
      console.log(ctx.params)
      const {email} = ctx.params
      console.log(email)
      const user = await strapi.query('user', 'users-permissions').findOne({email})
      return {
        statusCode: 200,
        message: user ? "Existe el usuario" : "No existe el usuario",
        exists: user ? true : false
      }
    }catch(e){
      console.log(e)
      return new GraphqlError("Ocurrio un error",500) 
    }
  },
/*
  async registerLoginWithFB(ctx){
    const {token: FbToken} = ctx.params
    try{
      const res = await axios.get(`https://graph.facebook.com/v2.12/me?fields=name,email,birthday&access_token=${FbToken}`)
      const fbUser = {
        email: res.data.email,
        username: res.data.name,
        fechaNacimiento: new Date(res.data.birthday),
        password: res.data.name
      }

      /*Find user with email
      let user = await strapi.query('user', 'users-permissions').findOne( {
        _where: {email: fbUser.email}
      } )
      
      /*  if user doesn't exists, register  
      if(!user){
        ctx.request.body = fbUser
        await strapi.plugins['users-permissions'].controllers.auth.register(ctx)
        user = await strapi.query('user', 'users-permissions').findOne( {
          _where: {email: fbUser.email}
        } )
      }
      
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id
      })

      return {
        user,
        jwt
      }
    }catch(e){
      console.log(e)
      return new GraphqlError("Ocurrio un error",500) 
    }
  },

  async registerLoginWithG(ctx){
    const {token: GToken} = ctx.params
    try{
      const res = await axios.get(`https://people.googleapis.com/v1/people/me?personFields=birthdays`, {
        headers: {
          'Authorization': GToken
        }
      })
      const birthday = res.data.birthdays[0].date
      
      /*
      const fbUser = {
        email: res.data.email,
        username: res.data.name,
        fechaNacimiento: new Date(birthday.year, (birthday.month-1), birthday.day, 0,0,0,0),
        password: res.data.name
      }
      console.log( res.data.birthdays)
      
      console.log(birthday)
      console.log()
      
      return
      
      

      /*Find user with email
      let user = await strapi.query('user', 'users-permissions').findOne( {
        _where: {email: fbUser.email}
      } )
      
      /*  if user doesn't exists, register  
      if(!user){
        ctx.request.body = fbUser
        await strapi.plugins['users-permissions'].controllers.auth.register(ctx)
        user = await strapi.query('user', 'users-permissions').findOne( {
          _where: {email: fbUser.email}
        } )
      }
      
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id
      })

      return {
        user,
        jwt
      }
    }catch(e){
      console.log(e)
      return new GraphqlError("Ocurrio un error",500) 
    }
  },*/

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