const {getGoogleCalendar, getBusyHours, createEvent} = require('../../../util/calendar')
const stripe = require('stripe')('sk_test_51IpoF8GDAdhWlzXRqu29yBWkVUQA7pTuGACsKBihhRjIbXGs4OfeCdnpsQSAGXmMWJHRxrsms092HHwHLsEv2lJl00G85h7jHB');
const {pay} = require('../../../util/stripe')

module.exports = {

    async findBusyHours(ctx) {
        
        const { timeMin, timeMax } = ctx.params;
        const startDatetime = new Date(timeMin)
        const endDatetime = new Date(timeMax)
        if(!(startDatetime<endDatetime)) return ctx.badRequest("'timeMin' debe ser menor que 'timeMax'")
        
        let response = [];
        try{
            const calendar = await getGoogleCalendar();
            const busyHours = await getBusyHours(calendar, startDatetime, endDatetime)
            response = {"busyHours": busyHours}
        }catch(error){
            console.log(error)
            return ctx.serverUnavailable('Error al conectar con Google Calendar');
        }
        
        return response
    },

    async addCitaToSchedule(ctx){
        const CITA_ID = ctx.params.id
        const {duracion} = await strapi.services['config-asesoria'].find()
        const TITLE_EVENT = 'ASESORIA'

        /*GET DATA FROM ALREADY CREATED CITA*/
        const {usuario, fecha, asunto} = (await strapi.services.citas.findOne({ CITA_ID }))

        /*DEFINE WHEN EVENT ENDS*/
        const eDatetime = new Date(fecha)
        const sDatetime = new Date(fecha)
        eDatetime.setMinutes(sDatetime.getMinutes() + {duracion})

        /*CREATE EVENT ON GOOGLE CALENDAR*/
        let response = ''
        try{
            const calendar = await getGoogleCalendar();
            const busyHours = await getBusyHours(calendar, sDatetime, eDatetime)
            if(busyHours.length != 0){
                return ctx.serverUnavailable('Este horario ya esta en ocupado');
            }else{
                await createEvent(calendar, TITLE_EVENT, asunto, sDatetime, eDatetime, usuario.email)
                response = {
                    statusCode: 200,
                    message: "La asesoría se registro en el calendario exitosamente"
                }
            }
        }catch(error){
            console.log(error)
            return ctx.serverUnavailable('Error al conectar con Google Calendar');
        }

        /*UPDATE STATUS = REGISTRADA*/
        await strapi.services.citas.update({ id: CITA_ID }, {status: "AGENDADA"});


        return response;
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
            
            //UPDATE STATUS = REGISTRADA
            await strapi.services.citas.update({ id }, {status: "PAGADA"});

            return {
                statusCode: 200,
                message: 'Pago existoso'
            }
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Error al realizar el pago') 
        }
    }
    
};