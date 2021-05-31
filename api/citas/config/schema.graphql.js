const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        input addCitaToScheduleInput {
            where : InputID
        },
        type HourRange{
            start: DateTime
            end: DateTime
        },
        type findBusyHoursPayload {
            message: String
            statusCode: Int
            busyHours: [HourRange]
        },
        type findFreeHourRangesPayload {
            message: String
            statusCode: Int
            freeHourRanges: [HourRange]
        },
        input payCita{
            id: ID!,
            idPaymentMethod: ID
        },
        input payCitaInput {
            where : payCita
        },
        type payCitaPayload{
            statusCode: Int,
            clientSecret: String,
            message: String
        },
        type customeGenericPayload {
            statusCode: Int,
            message: String
        },
        input sendEmailWithConferenceLinkInput{
            where : InputID
        }
    `,
    mutation: `
        addCitaToSchedule(input: addCitaToScheduleInput): customeGenericPayload,
        payCita(input: payCitaInput): payCitaPayload,
        sendEmailWithConferenceLink(input: sendEmailWithConferenceLinkInput): customeGenericPayload
    `,
    query: `
        findFreeHourRanges(day: String!): findFreeHourRangesPayload
        findBusyHours(timeMin: String!, timeMax: String!): findBusyHoursPayload
    `,
    resolver: {
        Mutation: {
            addCitaToSchedule: {
                description: 'Add cita to schedule',
                resolver: 'application::citas.citas.addCitaToSchedule',
            },
            payCita:{
                description: 'Pay cita',
                resolverOf: 'application::citas.citas.payCita',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.citas.payCita(context)
                },
            },
            sendEmailWithConferenceLink:{
                description: 'Send email with the conference link',
                resolver: 'application::citas.citas.sendEmailWithConferenceLink'
            }
        },
        Query: {
            findFreeHourRanges: {
                description: 'Find Admin busy hours on Google Calendar',
                resolverOf: 'application::citas.citas.findFreeHourRanges',
                resolver: async (obj, opt, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.citas.findFreeHourRanges(context)
                },
            },
            findBusyHours: {
                description: 'Find Admin busy hours on Google Calendar',
                resolverOf: 'application::citas.citas.findBusyHours',
                resolver: async (obj, opt, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.citas.findBusyHours(context)
                },
            },
        },
    },
};