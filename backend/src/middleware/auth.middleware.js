import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async(req, res, next) => {
    try {
        //ottieni il token
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json ({message: "No authentication token, accesso negato"}); 

        //verifica il token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //trova l'utente
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json ({message: "Il token non è valido"}); 

        req.user = user;
        next();
    } catch (error) {
        console.error("Errore di autenticazione:", error.message);
        res.status(401).json({message: "Il token non è valido"});
    }
};

export default protectRoute;