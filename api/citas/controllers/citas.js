const {google} = require('googleapis');
const {OAuth2} = google.auth

module.exports = {

  async findBusy(ctx) {

    const { timeMin, timeMax } = ctx.params;
    const startDatetime = new Date(timeMin)
    const endDatetime = new Date(timeMax)
    if(!(startDatetime<endDatetime)) return ctx.badRequest("'timeMin' debe ser menor que 'timeMax'")

    const {GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_TOKEN} = process.env

    const oAuth2Client = new OAuth2(GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET)
    oAuth2Client.setCredentials({
        refresh_token: GOOGLE_CALENDAR_TOKEN
    })

    const calendar = google.calendar({version: 'v3', auth: oAuth2Client})

    let response;
    try{
        const calResponse = await calendar.freebusy.query({
            resource: {
                timeMin: startDatetime,
                timeMax: endDatetime,
                items: [{
                    id: "primary"
                }]
            }
        })
        response = calResponse.data.calendars.primary.busy
    }catch(error){
        console.log(error)
        ctx.serverUnavailable('Error al conectar con Google Calendar');
    }

    return response
  },

};