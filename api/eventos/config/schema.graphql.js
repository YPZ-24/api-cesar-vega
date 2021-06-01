const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        type findCurrentEventsPayload{
            statusCode: Int,
            currentEvents: [Eventos]
        }
    `,
    query: `
        findCurrentEvents :findCurrentEventsPayload
    `,
    resolver: {
        Query: {
            findCurrentEvents:{
                description: 'Find current notifications',
                resolver: 'application::eventos.eventos.findCurrentEvents',
            }
        }
    },
};