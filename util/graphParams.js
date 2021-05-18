
function getStrapiParams(oldParams){
    let newParams = {};
    for(let p in oldParams ){
        if(p[0]==='_') newParams[p.substr(1)] = oldParams[p]
        else newParams[p] = oldParams[p]
    }
    return newParams
}

module.exports = {
    getStrapiParams
}