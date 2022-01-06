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
        },
        type getProfilePayload{
            username: String,
            email: String,
            fechaNacimiento: Date,
            telefono: String,
            saldo: Int,
            imagenPerfil: UploadFile,
            emailConfirmed: Boolean
        },
        input addUserWhere{
            idCurso: ID!
        },
        input addUserInput{
            where: addUserWhere!
        },
        type userExistsWithEmailPayload{
            statusCode: Int,
            message: String
            exists: Boolean
        },
        input jwtInput{
            jwt: String
        },
        input refreshTokenInput{
            where: jwtInput
        },
        input tokenInput{
            token: String
        },
        input socialIDInput{
            socialID: String
        },
        input registerLoginWithGInput{
            where: tokenInput
        },
        input registerLoginWithFBInput{
            where: tokenInput
        },
        input registerLoginWithIOSInput{
            where: socialIDInput,
        }
        type refreshTokenPayload{
            statusCode: Int,
            jwt: String
        }
        extend type UsersPermissionsMe {
            cliente: Boolean,
            imagenPerfil: UploadFile,
            saldo: Float,
            customerId: String,
            emailConfirmed: Boolean
        },
        type UsersPermissionsMeC {
            id: ID!,
            username: String,
            email: String,
            confirmed: Boolean,
            blocked: Boolean,
            role: UsersPermissionsMeRole,
            cliente: Boolean,
            imagenPerfil: UploadFile,
            saldo: Float,
            customerId: String,
            emailConfirmed: Boolean
        },
        type UsersPermissionsLoginPayloadC{
            jwt: String!,
            user: UsersPermissionsMeC
        }
        input createUserReferedData{
            telefono: Long!,
            username: String!
        }
        input createUserReferedInput{
            data: createUserReferedData
        }
        type UsersPermissionsUserC{
            id: ID!
            _id: ID!,
            createdAt: DateTime,
            updatedAt: DateTime,
            username: String,
            email: String,
            provider: String,
            role: UsersPermissionsRole,
            confirmed: Boolean,
            blocked: Boolean,
            fechaNacimiento: Date,
            telefono: Long,
            saldo: Float,
            codigoReferido: Codigos,
            customerId: String,
            imagenPerfil: UploadFile,
            cliente: Boolean,
            emailConfirmed: Boolean,
            socialID: String,
            codigos: [Codigos],
            citas: [Citas],
            videos_usuarios: [VideosUsuario],
            dispositivos: [Dispositivos],
            cursos: [Cursos]
        }
        type createUserPayloadC{
            user: UsersPermissionsUserC
        }
        input getReferedMessageUrlData{
            userID: ID!,
            referedUserID: ID!
        }
        input getReferedMessageUrlInput{
            data: getReferedMessageUrlData
        }
        type getReferedMessageUrlPayload{
            urlMessage: String!
        }
    `,
    mutation: `
        refreshToken(input: refreshTokenInput): refreshTokenPayload
        registerLoginWithG(input: registerLoginWithGInput): UsersPermissionsLoginPayloadC
        registerLoginWithFB(input: registerLoginWithFBInput): UsersPermissionsLoginPayloadC
        registerLoginWithIOS(input: registerLoginWithIOSInput): UsersPermissionsLoginPayloadC
        createCustomerId: customeGenericPayload,
        createUserRefered(input: createUserReferedInput): createUserPayloadC,
        createUserGeneric(input: createUserInput): createUserPayload,
        addCurso(input: addUserInput): customeGenericPayload,
        sendEmailConfirmation: customeGenericPayload
        getReferedMessageUrl(input: getReferedMessageUrlInput): getReferedMessageUrlPayload
    `,
    query: `
        getPaymentMethods: getPaymentMethodsPayload,
        getProfile(id: ID!): getProfilePayload,
        userExistsWithEmail(email: String!): userExistsWithEmailPayload
    `,
    resolver: {
        Mutation: {
            getReferedMessageUrl: {
                description: 'Send message to admin with the refered user info',
                resolverOf: 'application::user.user.getReferedMessageUrl',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.getReferedMessageUrl(context)
                },
            },
            refreshToken: {
                description: 'Refresh an existing token',
                resolverOf: 'application::user.user.refreshToken',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.refreshToken(context)
                },
            },
            registerLoginWithG: {
                description: 'login a user, if doesnt exists, register too',
                resolverOf: 'application::user.user.registerLoginWithG',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.registerLoginWithG(context)
                },
            },
            registerLoginWithFB: {
                description: 'login a user, if doesnt exists, register too',
                resolverOf: 'application::user.user.registerLoginWithFB',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.registerLoginWithFB(context)
                },
            },
            registerLoginWithIOS: {
                description: 'login a user, if doesnt exists, register too',
                resolverOf: 'application::user.user.registerLoginWithIOS',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.registerLoginWithIOS(context)
                },
            },
            sendEmailConfirmation: {
                description: 'Send an email to confirm email',
                resolver: 'application::user.user.sendEmailConfirmation'
            },
            createCustomerId: {
                description: 'Create a Stripe customer Id for the authenticated user',
                resolver: 'application::user.user.createCustomerId',
            },
            createUserRefered: {
                description: 'Create user as a refered user',
                resolver: 'application::user.user.createUserRefered',
            },
            createUserGeneric: {
                description: 'Create a generic user',
                resolver: 'application::user.user.createUserGeneric',
            },
            addCurso: {
                description: 'Add curso to authenticated user',
                resolverOf: 'application::user.user.addCurso',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.addCurso(context)
                },
            }
        },
        Query: {
            getPaymentMethods: {
                description: 'Get user authenticated payment methods',
                resolver: 'application::user.user.getPaymentMethods',
            },
            getProfile: {
                description: 'Get data to user profile',
                resolver: 'application::user.user.getProfile',
            },
            userExistsWithEmail: {
                description: 'Returns if and user with specific email exists',
                resolverOf: 'application::user.user.userExistsWithEmail',
                resolver: async (obj, options, { context }) => {
                    context.params = getStrapiParams(context.params)
                    return await strapi.controllers.user.userExistsWithEmail(context)
                },
            }
        },
    },
};