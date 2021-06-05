module.exports = {

    async findCurrentEvents(ctx){
        const now = new Date()
        now.setDate(now.getDate() - 1)
        const events = await strapi.services.eventos.find({fecha_gt: now})
        return {
            statusCode: 200,
            currentEvents: events
        }
    }

};
