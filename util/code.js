function generateCode({username}){
    let code = '';
    const names = username.split(' ')
    names.forEach(n => {
        code += n.slice(0, 2)
    });

    //Random Number [0,9999]
    code += Math.ceil(Math.floor((Math.random() * 9) + 0)).toString()
    code += Math.ceil(Math.floor((Math.random() * 9) + 0)).toString()
    code += Math.ceil(Math.floor((Math.random() * 9) + 0)).toString()
    code += Math.ceil(Math.floor((Math.random() * 9) + 0)).toString()
    return code;
}

module.exports = {
    generateCode
}