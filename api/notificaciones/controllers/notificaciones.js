
module.exports = {

    async findCurrentNotifications(ctx){
        const now = new Date()
        now.setDate(now.getDate() - 30)
        const notifications = await strapi.services.notificaciones.find({published_at_gt: now, _sort: 'published_at:asc'})
        return {
            statusCode: 200,
            currentNotifications: notifications
        }
    }

};
