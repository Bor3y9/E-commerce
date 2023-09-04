const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    return jwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    })
}

 async function isRevoked(req, token) {
    //console.log(token)
    if(!token.payload.isAdmin) {
        return true;
    }
    else{
        return false;
    }
}


module.exports = authJwt;
