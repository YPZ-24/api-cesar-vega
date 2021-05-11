const {getGoogleCalendar, getBusyHours, createEvent} = require('../../../util/calendar')
const stripe = require('stripe')('sk_test_51IpoF8GDAdhWlzXRqu29yBWkVUQA7pTuGACsKBihhRjIbXGs4OfeCdnpsQSAGXmMWJHRxrsms092HHwHLsEv2lJl00G85h7jHB');


module.exports = {

    async findBusyy(ctx) {
        
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

    async updateCreateEvent(ctx){
        const {id} = ctx.params
        const DURATION_EVENT_MINUTES = 30
        const TITLE_EVENT = 'ASESORIA'

        /*GET DATA FROM ALREADY CREATED CITA*/
        const {usuario, fecha, asunto} = (await strapi.services.citas.findOne({ id }))

        /*DEFINE WHEN EVENT ENDS*/
        const eDatetime = new Date(fecha)
        const sDatetime = new Date(fecha)
        eDatetime.setMinutes(sDatetime.getMinutes() + DURATION_EVENT_MINUTES)

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
        await strapi.services.citas.update({ id }, {status: "REGISTRADA"});


        return response;
    },

    async findBusssy(ctx){
        //const customer = await stripe.customers.create();
        const CUSTOMER_ID = 'cus_JSl6CMExRCx54s'
        const AMOUNT = 20000
        const PAYMENT_METHOD_ID = 'card_1IppaRGDAdhWlzXRF9K0Idcd'
        try{
            const intent = await stripe.paymentIntents.create({
                amount: AMOUNT,
                currency: 'MXN',
                customer: CUSTOMER_ID,
                payment_method: PAYMENT_METHOD_ID,
                payment_method_types: ['card'],
                confirm: true
            });

            let response;
            if(intent.status === 'succeeded'){
                response = {
                    statusCode: 200,
                    message: "Pago Exitoso"
                }
            }else{
                return ctx.serverUnavailable('Algo anda mal');
            }
        }catch(error){
            console.log(error)
            return ctx.serverUnavailable('Algo anda mal');
        }

        return response
    },

    async findBusy(ctx){
        const CUSTOMER_ID = 'cus_JSl6CMExRCx54s'
        let paymentMethods = []
        try{
            paymentMethods = await stripe.paymentMethods.list({
                customer: CUSTOMER_ID,
                type: 'card',
            });
        }catch(error){
            console.log(error)
            return ctx.badImplementation('Ocurrio un error en el servidor')   
        }
        return paymentMethods.data;
    }


};