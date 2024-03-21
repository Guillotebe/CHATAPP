import {jwt} from "../utils/index.js";

function asureAuth (req, res, next) {
    if(!req.headers.authorization){
        return res
        .status(403)
        .send ({msg: "La peticion no tiene la cabecera de autenticacion"});
    }

    const token = req.headers.authorization.replace("Bearer ", "");

    try {
        const hasExpired = jwt.hasExpiredToken(token);

        if(hasExpired) {
            return res.status(400).send({msg:"el token ha expirado"});
        }

        const payload = jwt.decoded(token);
        req.user = payload; 

        next();
        } catch (error) {
            console.log(error)
        return res.status(400).send({msg: "Token invalid"});
    }
}

export const mdAuth = {
    asureAuth,
};

