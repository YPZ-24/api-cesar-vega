module.exports = {

    async findCurrentEvents(ctx){
        /*Get data from authenticated user*/
        const {cliente} = ctx.state.user

        const now = new Date()
        now.setDate(now.getDate() - 1)
        let events = []
        if(cliente) events = await strapi.services.eventos.find({fecha_gt: now})
        else events = await strapi.services.eventos.find({fecha_gt: now, publico: true})
        
        return {
            statusCode: 200,
            currentEvents: events
        }
    }

};
