//const CALENDAR_ID = process.env.CALENDAR_ID
const CALENDAR_ID = "yepezaylin24@gmail.com"
const EMAIL_G_SUITE = process.env.EMAIL_G_SUITE
const {google} = require('googleapis');
let privatekey = require("../keys/googleCalendarKey.json");

async function getGoogleCalendar(){
    let jwtClient = new google.auth.JWT({
        email: privatekey.client_email,
        key: privatekey.private_key,
        scopes:['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
        //subject: EMAIL_G_SUITE
    })
    try{
        const r = await jwtClient.authorize()
        return google.calendar({version: 'v3', auth: jwtClient})
    }catch(error){
        throw new Error(error)
    }
}


async function getBusyHours({startDatetime, endDatetime}){
    try{
        const calendar = await getGoogleCalendar();
        const res = await calendar.freebusy.query({
            resource: {
                timeMin: startDatetime,
                timeMax: endDatetime,
                items: [{
                    id: CALENDAR_ID
                }]
            }
        })
        return res.data.calendars[CALENDAR_ID].busy
    }catch(error){
        throw new Error(error)
    }
}

async function createEvent({title, description, startDatetime, endDatetime, attendeeEmail}){
    
    const event = {
        summary: title,
        description: description,
        sendNotifications: true,
        start: {
            dateTime: startDatetime
        },
        end: {
            dateTime: endDatetime
        },
        /*
        conferenceData:{
            createRequest:{
                requestId: "cesarVegaKey",
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                },
                
            }
        },
        attendees: [
            {
                email: attendeeEmail
            },
        ]*/
    };
    const calendar = await getGoogleCalendar();
    
    const a = await calendar.events.insert({
        calendarId: CALENDAR_ID, 
        conferenceDataVersion: 1,
        resource: event
    })
    a.data.hangoutLink = 'https://meet.google.com/rnt-gpgs-pbu'
    return a;
}

module.exports = {
    getGoogleCalendar,
    getBusyHours,
    createEvent
}