const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        type addCitaToSchedulePayload {
            statusCode: Int
            message: String
        },
        input addCitaToScheduleInput {
            where : InputID
        },
        type BusyHour{
            start: String
            end: String
        },
        type findBusyHoursPayload {
            statusCode: Int
            busyHours: [BusyHour]
        },
        input payCita{
            id: ID!,
            idPaymentMethod: ID!
        },
        input payCitaInput {
            where : payCita
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
        addCitaToSchedule(input: addCitaToScheduleInput): addCitaToSchedulePayload,
        payCita(input: payCitaInput) : customeGenericPayload,
        sendEmailWithConferenceLink(input: sendEmailWithConferenceLinkInput): customeGenericPayload
    `,
    query: `
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