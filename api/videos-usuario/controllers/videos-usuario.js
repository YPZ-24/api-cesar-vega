'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

    async createOrUpdateVistoCalificacion(ctx){
        /*Get data from authenticated user*/
        const {id: idUser} = ctx.state.user
        /*Get data from params*/
        const {id: idVideo} = ctx.params
        /*Get data from body*/
        const {visto, calificacion} = ctx.request.body

        let videoUsuario = await strapi.services["videos-usuario"].findOne({ usuario: idUser, video: idVideo });
        if(videoUsuario){
            if(!videoUsuario.visto && visto) videoUsuario = await strapi.services["videos-usuario"].update({id: videoUsuario.id}, {visto: true});
            if(calificacion) videoUsuario = await strapi.services["videos-usuario"].update({id: videoUsuario.id}, {calificacion});
        }
        else{
            videoUsuario = {
                usuario: idUser,
                video: idVideo,
            }
            if(visto) videoUsuario.visto = visto
            if(calificacion) videoUsuario.calificacion = calificacion
            await strapi.services["videos-usuario"].create(videoUsuario);
        }
        return videoUsuario;
    },

    async addComment(ctx){
        /*Get data from authenticated user*/
        const {id: idUser} = ctx.state.user
        /*Get data from params*/
        const {id: idVideo} = ctx.params
        /*Get data from body*/
        const {comentario} = ctx.request.body

        let videoUsuario = await strapi.services["videos-usuario"].findOne({ usuario: idUser, video: idVideo });

        if(!videoUsuario) videoUsuario = await strapi.services["videos-usuario"].create({ usuario: idUser, video: idVideo });
        await strapi.services["videos-comentarios"].create({ videos_usuario:videoUsuario.id, comentario });
        
        return {
            statusCode: 200,
            message: 'Comentario agregado exitosamente'
        }
    }


};
