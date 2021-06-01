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
        }
    `,
    mutation: `
        createCustomerId: customeGenericPayload,
    `,
    query: `
        getPaymentMethods: getPaymentMethodsPayload
    `,
    resolver: {
        Mutation: {
            createCustomerId: {
                description: 'Create a Stripe customer Id for the authenticated user',
                resolver: 'application::user.user.createCustomerId',
            }
        },
        Query: {
            getPaymentMethods: {
                description: 'Get user authenticated payment methods',
                resolver: 'application::user.user.getPaymentMethods',
            },
        },
    },
};