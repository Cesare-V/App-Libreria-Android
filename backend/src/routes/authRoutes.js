//Importare libreria Express
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Instradare il server
const router = express.Router();

//Generare token dall'id dell'Utente
const generateToken = (userId) => {
   return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d"});
}

//Endpoint per il login e registrazione
router.post("/register", async(req, res) => {
    try {
        const {email,username,password} = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({message: "Compila tutti i campi"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "La Password dovrebbe essere lunga minimo 6 caratteri"});
        }

        if(username.length < 3){
            return res.status(400).json({message: "L'username dovrebbe essere lungo minimo 3 caratteri"});
        }

        //Controlla se l'Utente esiste già
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({message: "L'email esiste già"});
        }

        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return res.status(400).json({message: "L'utente esiste già"});
        }

        //Ottieni Avatar random
        const profileImage = `https://api.dicebear.com/9.x/micah/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,
        });

        await user.save();

        //Genera il token
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: new Date(),
            },
        });
    } catch (error) {
        console.log("Errore nel percorso di registrazione", error);
        res.status(500).json({message: "Errore interno nel server"});
    }
});

router.post("/login", async(req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({message: "Tutti i campi sono obbligatori"});
        
        //Controlla se l'utente esiste
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message: "Credenziali non valide"});

        //Controlla se la password è corretta
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) return res.status(400).json({message: "Password non corretta"});

        //Genera il token
        const token = generateToken(user._id);
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.log("Errore nel percorso di login", error);
        res.status(500).json({message: "Errore interno del server"});
    }
});

//Esportare la variabile router
export default router;