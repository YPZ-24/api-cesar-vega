module.exports = {
    definition: `
        input useCodeInput{
            where : InputID
        }
    `,
    mutation: `
        useCode(input: useCodeInput): customeGenericPayload
    `,
    resolver: {
        Mutation: {
            useCode: {
                description: 'Add cita to schedule',
                resolver: 'application::codigos.codigos.useCode',
            }
        }
    },
};