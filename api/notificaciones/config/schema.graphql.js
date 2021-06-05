module.exports = {
    definition: `
        type findCurrentNotificationsPayload{
            statusCode: Int,
            currentNotifications: [Notificaciones]
        }
    `,
    query: `
        findCurrentNotifications : findCurrentNotificationsPayload
    `,
    resolver: {
        Query: {
            findCurrentNotifications:{
                description: 'Find current notifications',
                resolver: 'application::notificaciones.notificaciones.findCurrentNotifications',
            }
        }
    },
};