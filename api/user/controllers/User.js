const {getCustomerCards, generateCustomerId} = require('../../../util/stripe')
const GraphqlError = require('../../../util/errorHandler');
const { sendEmail } = require('../../../util/mailer');
const { default: axios } = require('axios');
const SOCIALID_KEY_FB = "FB"
const SOCIALID_KEY_IOS = "IOS"

module.exports = {

  async getProfile(ctx){
    try{
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
    }catch(e){
      console.log(e)
      return new GraphqlError("Lo siento, ocurrio un error", 500) 
    }
  },

  async getReferedMessageUrl(ctx){
    try{
      const {userID, referedUserID} = ctx.request.body
      const user = await strapi.query('user', 'users-permissions').findOne({id: userID});
      const referedUser = await strapi.query('user', 'users-permissions').findOne({id: referedUserID});
      if(!user) return new GraphqlError("El usuario no existe", 400) 
      if(!referedUser) return new GraphqlError("El usuario referido no existe", 400) 
      if(!referedUser.codigoReferido) return new GraphqlError("El usuario referido, no es referido", 400) 
      const message = `Hola...!%20Soy ${user.username}%20y%20me%20gustaría%20referir%20a%20${referedUser.username}%20con%20${referedUser.telefono}%20numero%20y%20el%20código%20de%20referido%20%22${referedUser.codigoReferido.codigo}%22.`
      const {telefono} = await strapi.services['confg-whatsapp'].find()
      const urlMessage = `https://api.whatsapp.com/send?phone=${telefono}&text=${message}`

      return {
        urlMessage
      }
    }catch(e){
      console.log(e)
      return new GraphqlError("Lo siento, ocurrio un error", 500) 
    }
  },

  async createUserRefered(ctx){
    try{
      const {username, telefono} = ctx.request.body

      ///-----From Strapi DOCS
      const pluginStore = await strapi.store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
      });
      const settings = await pluginStore.get({
        key: 'advanced',
      });
      const role = await strapi
        .query('role', 'users-permissions')
        .findOne({ type: settings.default_role }, []);
      //----
      // Shape user
      const referedUser = {
        username: username,
        telefono: telefono,
        role: role.id,
        confirmed: true,
        emailConfirmed: true,
        cliente: true,
        blocked: true
      }

      //Create user
      const newUser = await strapi.query('user', 'users-permissions').create(referedUser);

      //user = await strapi.query('user', 'users-permissions').update({ email: ctx.request.body.email }, {blocked: true, cliente: true})
      return newUser;
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
      const {email} = ctx.params
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

  async refreshToken(ctx){
    let {jwt} = ctx.params;
    let payloadJWT = await strapi.plugins['users-permissions'].services.jwt.verify(jwt);
    if(new Date(payloadJWT.exp*1000) < new Date()){
      jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: payloadJWT.id
      })
    }
    
    return {
      statusCode: 201,
      jwt
    }
  },

  async registerLoginWithFB(ctx){
    const {token: FbToken} = ctx.params
    try{
      const res = await axios.get(`https://graph.facebook.com/v2.12/me?fields=name,email,birthday&access_token=${FbToken}`)
      if(!res.data.id) return new GraphqlError("Tu clave de acceso es incorrecta", 400) 

      /*Find user with facebook id user*/
      let user = await strapi.query('user', 'users-permissions').findOne( {
        _where: {socialID: SOCIALID_KEY_FB+res.data.id}
      } )
      
      /*  if user doesn't exists, register*/  
      if(!user){
        ///-----From Strapi DOCS
        const pluginStore = await strapi.store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
        });
        const settings = await pluginStore.get({
          key: 'advanced',
        });
        const role = await strapi
          .query('role', 'users-permissions')
          .findOne({ type: settings.default_role }, []);
        //----
        // Shape user
        const fbUser = {
          role: role.id,
          socialID: SOCIALID_KEY_FB+res.data.id,
          confirmed: true,
          emailConfirmed: true
        }
        if(res.data.email) fbUser.email = res.data.email
        if(res.data.name){
          fbUser.username = res.data.name
          fbUser.password = res.data.name
        } 
        if(res.data.birthday) fbUser.fechaNacimiento = new Date(res.data.birthday)
        //Create user
        user = await strapi.query('user', 'users-permissions').create(fbUser);
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

  async registerLoginWithIOS(ctx){
    const {socialID: socialID} = ctx.params

    try{
      /*Find user with social id*/
      let user = await strapi.query('user', 'users-permissions').findOne( {
        _where: {socialID: SOCIALID_KEY_IOS + socialID}
      } )
      
      /*  if user doesn't exists, register*/  
      if(!user){
        ///-----From Strapi DOCS
        const pluginStore = await strapi.store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
        });
        const settings = await pluginStore.get({
          key: 'advanced',
        });
        const role = await strapi
          .query('role', 'users-permissions')
          .findOne({ type: settings.default_role }, []);
        //----

        const iosUser = {
          role: role.id,
          socialID: SOCIALID_KEY_IOS+socialID,
          confirmed: true,
          emailConfirmed: true
        }

        ctx.request.body = iosUser
        //await strapi.plugins['users-permissions'].controllers.auth.register(ctx)
        user = await strapi.query('user', 'users-permissions').create(iosUser);
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
    const {token: gAuthToken} = ctx.params
    try{
      const res = await axios.get(`https://people.googleapis.com/v1/people/me?personFields=birthdays,emailAddresses,names,photos`, {
        headers: {
          'Authorization': gAuthToken
        }
      })
      const birthday = res.data.birthdays[0].date;
      const fbUser = {
        username: res.data.names[0].displayName,
        email: res.data.emailAddresses[0].value,
        fechaNacimiento: new Date(birthday.year, (birthday.month-1), birthday.day, 0,0,0,0),
        password: res.data.names[0].displayName,
      }

      /*Find user with email*/
      let user = await strapi.query('user', 'users-permissions').findOne( {
        _where: {email: fbUser.email}
      } )
      
      /*  if user doesn't exists, register  */
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
      if(!email) return new GraphqlError('Para realizar esta acción, registra un correo electrónico', 400) 
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
    if(!email) return new GraphqlError('Para realizar esta acción, registra un correo electrónico', 400) 
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