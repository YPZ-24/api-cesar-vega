const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        input useCodeInput{
            where : useCode
        },
        input useCode{
            codigo : String!
        },
        input createCodigo {
            usuarioReferido: ID!
        },
        input createCodigoInputC{
            data: createCodigo
        },
        type createCodigoPayloadC{
            statusCode: Int,
            code: String
        }
    `,
    mutation: `
        useCode(input: useCodeInput): customeGenericPayload,
        createCodigoC(input: createCodigoInputC): createCodigoPayloadC
    `,
    resolver: {
        Mutation: {
            useCode: {
                description: 'Add cita to schedule',
                resolverOf: 'application::codigos.codigos.useCode',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.codigos.useCode(context)
                },
            },
            createCodigoC: {
                description: 'Create code to user Authenticated',
                resolver: 'application::codigos.codigos.create'
            }
        }
    },
};