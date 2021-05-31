module.exports = {
    definition: `
        input useCodeInput{
            where : InputID
        },
        input createCodigo {
            usuarioReferido: ID!
        },
        input createCodigoInputC{
            data: createCodigo
        },
        type createCodigoPayloadC{
            message: String,
            statusCode: Int,
            code: String
        }
    `,
    mutation: `
        useCode(input: useCodeInput): customeGenericPayload,
        createCodigoC(input: createCodigoInputC): createCodigoPayloadC
    `,
    resolver: {
        Mutation: {
            useCode: {
                description: 'Add cita to schedule',
                resolver: 'application::codigos.codigos.useCode',
            },
            createCodigoC: {
                description: 'Create code to user Authenticated',
                resolver: 'application::codigos.codigos.create'
            }
        }
    },
};