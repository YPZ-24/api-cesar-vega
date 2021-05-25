const {getStrapiParams} = require('../../../util/graphParams')

module.exports = {
    definition: `
        input createOrUpdateVistoCalificacion{
            visto: Boolean,
            calificacion: Float
        },
        input addComment{
            comentario: String
        },
        input createOrUpdateVistoCalificacionInput{
            where : InputID
            data : createOrUpdateVistoCalificacion
        },
        input addCommentInput{
            where : InputID
            data : addComment
        }
    `,
    mutation: `
        createOrUpdateVistoCalificacion(input: createOrUpdateVistoCalificacionInput): VideosUsuario,
        addComment(input: addCommentInput): customeGenericPayload
    `,
    resolver: {
        Mutation: {
            createOrUpdateVistoCalificacion: {
                description: 'Create or update visto and/or calificacion Id for the authenticated user relation with video',
                resolverOf: 'application::videos-usuario.videos-usuario.createOrUpdateVistoCalificacion',
                resolver: async (obj, opt, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers['videos-usuario'].createOrUpdateVistoCalificacion(context)
                },
            },
            addComment: {
                description: 'Add comment',
                resolverOf: 'application::videos-usuario.videos-usuario.addComment',
                resolver: async (obj, opt, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers['videos-usuario'].addComment(context)
                },
            }
        }
    },
};