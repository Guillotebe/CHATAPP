import bscrypt  from "bcryptjs";
import { User } from "../models/index.js";
import { jwt } from "../utils/index.js";



function register(req, res) {
    const { email, password } = req.body ;
    const user = new User({
        email: email.toLowerCase(),
    });

    const salt= bscrypt.genSaltSync(10);
    const hashPassword= bscrypt.hashSync(password, salt);
    user.password = hashPassword;

    user.save().then((userStorage)=>{
        res.status(201).send(userStorage);
    }).catch((err)=>{
        res.status(400).send({ msg: "Error al registrar el usuario" });
    })
}

async function login(req, res) {
    const {email, password} =req.body;
    const emailLowerCase = email.toLowerCase();
    try {
        const userStorage = await User.findOne({email:emailLowerCase});
        const check = await bscrypt.compare(password, userStorage.password);
        if (!check) {
            res.status(400).send({msg: "Contraseña incorrecta"});
        } else {
            res.status(200).send({
                access: jwt.createAccessToken(userStorage),
                refresh: jwt.createResfreshToken(userStorage),
            });
        }
    } catch (error) {
        res.status(500).send({msg: "Error del servidor"});
    }
}

async function refreshAccessToken(req, res) {
    const {refreshToken} =req.body;
    if(!refreshToken) {
        res.status(400).send ({msg: "Token requerido"})
    };
    
    const hasExpired = jwt.hasExpiredToken(refreshToken);
    if (hasExpired) {
        res.status(400).send({msg: "token expirado"})
    };

    try {
        const {user_id} =jwt.decoded(refreshToken);
        const userStorage = await User.findById(user_id);
        res.status(200).send({
            accessToken: jwt.createAccessToken(userStorage),
        });
    } catch (error) {
        res.status(500).send({msg: "Server error"}) 
    }
}

export const AuthController = {
    register,
    login,
    refreshAccessToken,
};