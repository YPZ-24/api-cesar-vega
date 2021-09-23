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
            imagenPerfil: UploadFile,
            emailConfirmed: Boolean
        },
        input addUserWhere{
            idCurso: ID!
        },
        input addUserInput{
            where: addUserWhere!
        },
        type userExistsWithEmailPayload{
            statusCode: Int,
            message: String
            exists: Boolean
        }
    `,
    mutation: `
        createCustomerId: customeGenericPayload,
        createUserRefered(input: createUserInput): createUserPayload,
        createUserGeneric(input: createUserInput): createUserPayload,
        addCurso(input: addUserInput): customeGenericPayload,
        sendEmailConfirmation: customeGenericPayload
    `,
    query: `
        getPaymentMethods: getPaymentMethodsPayload,
        getProfile(id: ID!): getProfilePayload,
        userExistsWithEmail(email: String!): userExistsWithEmailPayload
    `,
    resolver: {
        Mutation: {
            sendEmailConfirmation: {
                description: 'Send an email to confirm email',
                resolver: 'application::user.user.sendEmailConfirmation'
            },
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
            },
            userExistsWithEmail: {
                description: 'Returns if and user with specific email exists',
                resolverOf: 'application::user.user.userExistsWithEmail',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.userExistsWithEmail(context)
                },
            }
        },
    },
};