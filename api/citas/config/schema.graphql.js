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
            statusCode: Int
            busyHours: [HourRange]
        },
        type findFreeHourRangesPayload {
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
        },
        extend type UsersPermissionsMe {
            cliente: Boolean,
            imagenPerfil: UploadFile,
            saldo: Float,
            customerId: String
        },
        type canPayWithSaldoPayload {
            statusCode: Int,
            can: Boolean,
            message: String,
            total: Float
        }
    `,
    mutation: `
        addCitaToSchedule(input: addCitaToScheduleInput): customeGenericPayload,
        payCita(input: payCitaInput): payCitaPayload,
        sendEmailWithConferenceLink(input: sendEmailWithConferenceLinkInput): customeGenericPayload,
        payCitaWithSaldo: customeGenericPayload,
        createCitaC(input: createCitaInput): Citas
    `,
    query: `
        findFreeHourRanges(day: String!): findFreeHourRangesPayload
        findBusyHours(timeMin: String!, timeMax: String!): findBusyHoursPayload,
        canPayCitaWithSaldo: canPayWithSaldoPayload
    `,
    resolver: {
        Mutation: {
            createCitaC: {
                description: 'Create cita',
                resolverOf: 'application::citas.citas.create',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.citas.create(context)
                },
            },
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
            },
            payCitaWithSaldo:{
                description: 'Pay cita with the user authenticated saldo',
                resolver: 'application::citas.citas.payCitaWithSaldo'
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
            canPayCitaWithSaldo: {
                description: 'Authenticated user can pay cita with his saldo?',
                resolver: 'application::citas.citas.canPayCitaWithSaldo',
            }
        },
    },
};