module.exports = {

    async findCurrentEvents(ctx){
        const events = await strapi.services.eventos.find()
        const currentEvents = events.filter(n => {
            const nDate = new Date(n.fecha)
            const now = new Date()
            now.setDate(now.getDate() - 1)
            if(nDate>now){
                return n
            }
        });
        return {
            statusCode: 200,
            currentEvents
        }
    }

};
