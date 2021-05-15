const {getBusyHours, createEvent} = require('../../../util/calendar')
const {pay} = require('../../../util/stripe')
const {sendEmail} = require('../../../util/mailer')

module.exports = {

    async findBusyHours(ctx) {
        /*Get data from params*/
        const { timeMin, timeMax } = ctx.params;
        const startDatetime = new Date(timeMin)
        const endDatetime = new Date(timeMax)
        /*Validations*/
        if(!(startDatetime<endDatetime)) return ctx.badRequest("'timeMin' debe ser menor que 'timeMax'")
        
        /*Connect with google calendar and get freebusy hours*/
        try{
            const busyHours = await getBusyHours({startDatetime, endDatetime})
            return response = {
                status: 200,
                "busyHours": busyHours
            }
        }catch(error){
            console.log(error)
            return ctx.serverUnavailable('Error al conectar con Calendar');
        }
    },

    async addCitaToSchedule(ctx){
        /*Get data from params*/
        const {id} = ctx.params
        const {duracion} = await strapi.services['config-asesoria'].find()
        const TITLE_EVENT = 'ASESORIA'

        /*Get data from already created cita*/
        const {usuario, fecha, asunto} = (await strapi.services.citas.findOne({ id }))

        /*Define when cita ends*/
        const eDatetime = new Date(fecha)
        const sDatetime = new Date(fecha)
        eDatetime.setMinutes(sDatetime.getMinutes() + duracion)
        try{
            /*Validations*/
            const busyHours = await getBusyHours({startDatetime: sDatetime, endDatetime: eDatetime})
            if(busyHours.length != 0){
                return ctx.serverUnavailable('Este horario ya esta en ocupado');
            }else{
                /*Create Google Calendar Event*/
                const {data} = await createEvent({
                    title: TITLE_EVENT, 
                    description: asunto, 
                    startDatetime: sDatetime, 
                    endDatetime: eDatetime, 
                    attendeeEmail: usuario.email
                })
                
                /*Update STATUS = REGISTRADA and save link to conference*/
                await strapi.services.citas.update({ id }, {status: "AGENDADA", enlace: data.hangoutLink});

                return {
                    statusCode: 200,
                    message: "Asesoría agendada"
                }
            }
        }catch(error){
            console.log(error)
            return ctx.serverUnavailable('Error al conectar con Calendar');
        }
    },

    async payCita(ctx){
        /*Get data from authenticated user*/
        const {customerId} = ctx.state.user
        /*Get data from params*/
        const {id, idPaymentMethod} = ctx.params
        /*Get data from config asesoria*/
        const {costo} = await strapi.services['config-asesoria'].find()
        
        try{
            //Pay with stripe
            await pay({CUSTOMER_ID: customerId, AMOUNT: costo, PAYMENT_METHOD_ID: idPaymentMethod})
            
            //Update STATUS = PAGADA
            await strapi.services.citas.update({ id }, {status: "PAGADA"});

            return {
                statusCode: 200,
                message: 'Pago existoso'
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Error al realizar el pago') 
        }
    },
    
    async sendEmailWithConferenceLink(ctx){
        /*Get data from params*/
        const {id} = ctx.params
        /*Get data from citas*/
        const {enlace, usuario, asunto} = await strapi.services.citas.findOne({ id });
        /*Sending email with cita conference link*/
        try{
            await sendEmail( {
                message: `${asunto}, Link para sesión: ${enlace}`, 
                receiver: usuario.email, 
                subject: "CESAR VEGA | ASESORIA" 
            })
            return {
                status: 200,
                message: "Link para asesoría enviado"
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Ocurrio un error al enviar email')
        }
    }

};