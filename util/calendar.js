const CALENDAR_ID = "aylinypz@soypolitecnico.org"
const EMAIL_G_SUITE = "aylinypz@soypolitecnico.org"
const {google} = require('googleapis');
let privatekey = require("../keys/googleCredentials.json");

function getGoogleCalendar(){
    let jwtClient = new google.auth.JWT({
        email: privatekey.client_email,
        key: privatekey.private_key,
        scopes:['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
        subject: EMAIL_G_SUITE
    })

    return new Promise((resolve, reject)=>{
        jwtClient.authorize((error, tokens) => {
            if (error) return reject(error)
            return resolve(google.calendar({version: 'v3', auth: jwtClient}))
        });
    })
}

async function getBusyHours(calendar, startDatetime, endDatetime){
    return new Promise((resolve, reject)=>{
        calendar.freebusy.query({
            resource: {
                timeMin: startDatetime,
                timeMax: endDatetime,
                items: [{
                    id: CALENDAR_ID
                }]
            }
        }, (error, res)=>{
            if (error) return reject(error)
            return resolve(res.data.calendars[CALENDAR_ID].busy)
        })
    })
}

async function createEvent(calendar, title, description, startDatetime, endDatetime, attendeeEmail){
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
        conferenceData:{
            createRequest:{
                requestId: "someRandomKey",
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                },
                
            }
        },
        attendees: [
            {
                email: attendeeEmail
            },
        ]
    };

    return new Promise((resolve, reject)=>{
        calendar.events.insert({
            calendarId: CALENDAR_ID, 
            conferenceDataVersion: 1,
            resource: event
        }, (error, res)=>{
            if (error) return reject(error)
            return resolve({eventId: res.data.id})
        })
    })
}

module.exports = {
    getGoogleCalendar,
    getBusyHours,
    createEvent
}