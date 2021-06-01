class GraphqlError extends Error {
    constructor(message, code){
        super(message || 'Lo siento, algo salio mal')
        this.messageTxt = message;
        this.code = code || 500;
    }
}

module.exports = GraphqlError