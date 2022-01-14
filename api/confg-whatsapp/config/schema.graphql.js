const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        input getMessageUrlData{
            encodeMessage: String!,
        }
        input getMessageUrlInput{
            data:getMessageUrlData
        }
        type getMessageUrlPayload{
            urlMessage: String!
        }
    `,
    mutation: `
        getMessageUrl(input: getMessageUrlInput): getMessageUrlPayload
    `,
    resolver: {
        Mutation: {
            getMessageUrl: {
                description: 'Send message to admin with the refered user info',
                resolverOf: 'application::user.user.getMessageUrl',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.getMessageUrl(context)
                },
            }
        }
    },
};