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
            statusCode: Int,
            clientSecret: String,
            message: String
        }
    `,
    mutation: `
        payCurso(input: payCursoInput) : payCursoPayload
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
            }
        }
    },
};