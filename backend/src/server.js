//Importare libreria Express, dotenv, authRoutes(login), database
import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

//Creare il server(app) Express
const app = express();


//Collegamento al Database
const PORT = process.env.PORT || 3000;

//Middleware per il login/autenticazione
job.start();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);


//Ascoltare il server sulla porta 3000
app.listen(PORT, () => {
    console.log(`Il server è in esecuzione sulla porta ${PORT}`);
    connectDB();
});