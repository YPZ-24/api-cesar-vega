const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        input payCurso{
            id: ID!,
            idPaymentMethod: ID
        },
        input payCursoInput {
            where : payCurso
        },
        type payCursoPayload{
            message: String
            statusCode: Int
            clientSecret: String
        },
        input payCursoWithSaldoInput{
            where: InputID!
        }
    `,
    mutation: `
        payCurso(input: payCursoInput) : payCursoPayload
        payCursoWithSaldo(input: payCursoWithSaldoInput): customeGenericPayload
    `,
    query : `
        canPayCursoWithSaldo(id: ID!): canPayWithSaldoPayload
    `,
    resolver: {
        Mutation: {
            payCurso:{
                description: 'Pay curso',
                resolverOf: 'application::cursos.cursos.payCurso',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.cursos.payCurso(context)
                },
            },
            payCursoWithSaldo:{
                description: 'Pay curso with the user authenticated saldo',
                resolverOf: 'application::cursos.cursos.payCursoWithSaldo',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.cursos.payCursoWithSaldo(context)
                },
            }
        },
        Query: {
            canPayCursoWithSaldo:{
                description: 'Authenticated user can pay curso with his saldo?',
                resolverOf: 'application::cursos.cursos.canPayCursoWithSaldo',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.cursos.canPayCursoWithSaldo(context)
                },
            }
        }
    },
};