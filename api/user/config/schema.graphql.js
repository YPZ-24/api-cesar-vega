const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        type Card{
            id: ID
            brand: String
            last4: String
        },
        type getPaymentMethodsPayload{
            statusCode: Int
            cards: [Card]
        },
        type getProfilePayload{
            username: String!,
            email: String!,
            edad: Int!,
            fechaNacimiento: Date!,
            telefono: String!,
            saldo: Int!,
            imagenPerfil: UploadFile
        },
        input addUserWhere{
            idCurso: ID!
        },
        input addUserInput{
            where: addUserWhere!
        }
    `,
    mutation: `
        createCustomerId: customeGenericPayload,
        createUserRefered(input: createUserInput): createUserPayload,
        createUserGeneric(input: createUserInput): createUserPayload,
        addCurso(input: addUserInput): customeGenericPayload
    `,
    query: `
        getPaymentMethods: getPaymentMethodsPayload,
        getProfile(id: ID!): getProfilePayload
    `,
    resolver: {
        Mutation: {
            createCustomerId: {
                description: 'Create a Stripe customer Id for the authenticated user',
                resolver: 'application::user.user.createCustomerId',
            },
            createUserRefered: {
                description: 'Create user as a refered user',
                resolver: 'application::user.user.createUserRefered',
            },
            createUserGeneric: {
                description: 'Create a generic user',
                resolver: 'application::user.user.createUserGeneric',
            },
            addCurso: {
                description: 'Add curso to authenticated user',
                resolverOf: 'application::user.user.addCurso',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.addCurso(context)
                },
            }
        },
        Query: {
            getPaymentMethods: {
                description: 'Get user authenticated payment methods',
                resolver: 'application::user.user.getPaymentMethods',
            },
            getProfile: {
                description: 'Get data to user profile',
                resolver: 'application::user.user.getProfile',
            }
        },
    },
};