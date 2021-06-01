const {generateCode} = require('../../../util/code')
const GraphqlError = require('../../../util/errorHandler')

module.exports = {

    async create(ctx) {
        /*Get data from authenticated user*/
        const {username, id} = ctx.state.user;
        /*Get data from body*/
        const {usuarioReferido} = ctx.request.body
        try{
            const {maxReferidos} = await strapi.services['config-referidos'].find()
            /*Validations*/
            const userCodes = await strapi.services.codigos.find({usuarioPropietario: id});
            if(userCodes.length>=maxReferidos)  return new GraphqlError('Ya no puedes crear más códigos', 400)
            if(id===usuarioReferido) return new GraphqlError('No puedes referiste un código a ti mismo', 400)
            const usrReferidoFinded = await strapi.query('user', 'users-permissions').findOne({ id: usuarioReferido })
            if(!usrReferidoFinded) return new GraphqlError('No existe el usuario a referir', 400)
            const codeUserExists = userCodes.filter(uc => { if(uc.usuarioReferido){ return uc.usuarioReferido.id === usuarioReferido} })
            if(codeUserExists.length!==0) return new GraphqlError('Ya creaste un código para este usuario', 400)
            
            /*Generate Code*/
            let codeFinded;
            let conta = 0;
            do{
                const code = generateCode({username});
                codeFinded = await strapi.services.codigos.find({codigo: code});
                if(codeFinded.length===0){
                    await strapi.services.codigos.create({codigo: code, usuarioPropietario: id, usuarioReferido});
                    return {
                        statusCode: 200,
                        code
                    }
                }
                conta++;
            }while(codeFinded!==0 && conta<=20)
            console.log(new Error('Demasiados intentos para crear el código'))
            return new GraphqlError('Error al crear código', 500) 
        }catch(error){
            console.log(error)
            return new GraphqlError() 
        }
    },

    async useCode(ctx){
        /*Get data from params*/
        const {id} = ctx.params
        try{
            /*Validations*/
            const code = await strapi.services.codigos.findOne({id});
            if(!code)  return new GraphqlError('No existe el código', 400) 
            if(code.usado)  return new GraphqlError('El código ya fue usado', 400) 
            /*Change usado state*/
            await strapi.services.codigos.update({id}, {usado: true});
            /*Send saldo to usuarioPropietario*/
            const usuarioPropietarioId = code.usuarioPropietario.id;
            let {saldo} = await strapi.query('user', 'users-permissions').findOne({id: usuarioPropietarioId})
            const {saldo: saldoADepositar} = await strapi.services['config-referidos'].find()
            saldo += saldoADepositar;
            await strapi.query('user', 'users-permissions').update({id: usuarioPropietarioId}, { saldo })
            /*UnBlock usuarioReferido*/
            const usuarioReferidoId = code.usuarioReferido.id;
            await strapi.query('user', 'users-permissions').update({id: usuarioReferidoId}, { blocked: false })

            return {
                statusCode: 200,
                message: 'Bienvenido'
            }
        }catch(error){
            console.log(error)
            return new GraphqlError() 
        }
        
    }

};
