module.exports = {
    definition: `
        type addCitaToSchedulePayload {
            statusCode: Int
            message: String
        },
        input addCitaToScheduleInput {
            where : InputID
        }
    `,
    mutation: `
        addCitaToSchedule(input: addCitaToScheduleInput): addCitaToSchedulePayload
    `,
    resolver: {
        Mutation: {
            addCitaToSchedule: {
                description: 'Add cita to schedule',
                resolver: 'application::citas.citas.addCitaToSchedule',
            },
        },
    },
};