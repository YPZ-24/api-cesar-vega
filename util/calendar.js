const CALENDAR_ID = process.env.CALENDAR_ID
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

//getFreeRanges({startDatetime: new Date('2021-05-27'), endDatetime: new Date('2021-05-28')})

async function getFreeRanges({startDatetime, endDatetime, duration}){
    try{
        const busyHours = await getBusyHours({startDatetime, endDatetime})
        const freeHours = getFreeHours({startDatetime, endDatetime, busyHours})
        let ranges = [];
        let eDatetime = new Date(startDatetime)
        let sDatetime = new Date(startDatetime)
        eDatetime.setMinutes(sDatetime.getMinutes() + duration)
        freeHours.forEach((fh, i)=>{
            while(eDatetime<=fh.end){
                ranges.push({
                    start: sDatetime,
                    end: eDatetime
                })
                eDatetime = new Date(eDatetime)
                sDatetime = new Date(eDatetime)
                eDatetime.setMinutes(sDatetime.getMinutes() + duration)
            }
            eDatetime = new Date(freeHours[i+1] ? freeHours[i+1].start: null)
            sDatetime = new Date(freeHours[i+1] ? freeHours[i+1].start: null)
            eDatetime.setMinutes(sDatetime.getMinutes() + duration)
        })
        return ranges;
    }catch(error){
        throw new Error(error)
    }
}

function getFreeHours({startDatetime, endDatetime, busyHours}){
    let ranges = []
    if(busyHours.length===0){
        ranges.push({
            start: new Date(startDatetime),
            end: new Date(endDatetime)
        })
    }else{
        let sDatetime = new Date(startDatetime)
        let eDatetime = new Date(busyHours[0] ? busyHours[0].start : endDatetime)
        for(let i=0; (i<= busyHours.length) && (eDatetime<endDatetime); i++){
            ranges.push({
                start: sDatetime,
                end: eDatetime
            })
            
            sDatetime = new Date(busyHours[i].end)
            eDatetime = new Date(busyHours[i+1] ? busyHours[i+1].start : endDatetime)
            ranges.push({
                start: sDatetime,
                end: eDatetime
            })

            sDatetime = new Date(busyHours[i+1] ? busyHours[i+1].end : null)
            eDatetime = new Date(busyHours[i+2] ? busyHours[i+2].start : endDatetime)
        }
        ranges.push({
            start: new Date(busyHours[busyHours.length-1].end),
            end: endDatetime
        })
    }
    return ranges;
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
    createEvent,
    getFreeRanges
}