const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        input payCurso{
            id: ID!,
            idPaymentMethod: ID!
        },
        input payCursoInput {
            where : payCurso
        },
        input createPayCurso{
            id: ID!,
        },
        input createPayCursoInput {
            where : createPayCurso
        },
        type createPayCursoPayload {
            statusCode: Int,
            clientSecret: String
        }
    `,
    mutation: `
        payCurso(input: payCursoInput) : customeGenericPayload,
        createPayCurso(input: createPayCursoInput) : createPayCursoPayload,
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
            createPayCurso:{
                description: 'Create pay curso',
                resolverOf: 'application::cursos.cursos.createPayCurso',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.cursos.createPayCurso(context)
                },
            }
        }
    },
};