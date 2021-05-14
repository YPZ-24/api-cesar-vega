const {generateCode} = require('../../../util/code')

module.exports = {

    async create(ctx) {
        /*Get data from authenticated user*/
        const {username, id} = ctx.state.user;
        /*Get data from body*/
        const {usuarioReferido} = ctx.request.body
        try{
            /*Validations*/
            const userCodes = await strapi.services.codigos.find({usuarioPropietario: id});
            if(userCodes.length>=4) return ctx.badRequest('Ya no puedes crear más códigos')
            if(id===usuarioReferido) return ctx.badRequest('No puedes referirte un código a ti')
            const usrReferidoFinded = await strapi.query('user', 'users-permissions').findOne({ id: usuarioReferido })
            if(!usrReferidoFinded) return ctx.badRequest('No existe el usuario a referir')
            const codeUserExists = userCodes.filter(uc =>  uc.usuarioReferido.id === usuarioReferido)
            if(codeUserExists.length!==0) return ctx.badRequest('Ya creaste un código para ese usuario')
            
            /*Generate Code*/
            let codeFinded;
            let conta = 0;
            do{
                const code = generateCode({username});
                codeFinded = await strapi.services.codigos.find({codigo: code});
                if(codeFinded.length===0){
                    await strapi.services.codigos.create({codigo: code, usuarioPropietario: id, usuarioReferido});
                    return {
                        status: 200,
                        code
                    }
                }
                conta++;
            }while(codeFinded!==0 && conta<=20)
            console.log(new Error('Demasiados intentos para crear el código'))
            return ctx.badImplementation('Error al crear código')
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Algo salio mal')
        }
    },

    async useCode(ctx){
        /*Get data from params*/
        const {id} = ctx.params
        try{
            /*Validations*/
            const code = await strapi.services.codigos.findOne({id});
            if(!code) return ctx.badRequest('No existe el código')
            if(code.usado) return ctx.badRequest('Este código ya fue usado')
            /*Change usado state*/
            await strapi.services.codigos.update({id}, {usado: true});
            /*Send saldo to usuarioPropietario*/
            const usuarioPropietarioId = code.usuarioPropietario.id;
            let {saldo} = await strapi.query('user', 'users-permissions').findOne({id: usuarioPropietarioId})
            saldo += 200;
            await strapi.query('user', 'users-permissions').update({id: usuarioPropietarioId}, { saldo })

            return {
                status: 200,
                message: 'Bienvenido'
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Algo salio mal')
        }
        
    }

};
