import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";
import Libri from "../models/Book.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image} = req.body;
        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Per favore compila tutti i campi" });
        }

        //Caricare l'immagine su Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        //Salvare i libri nel database
        const newBooks = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        })

        await newBooks.save();
        res.status(201).json(newBooks);

    } catch (error) {
        console.log("Errore nel creare i libri", error);
        res.status(500).json({message: error.message});
    }
});

//paginazione => scroll infinito/caricamento infinito
router.get("/", protectRoute, async (req, res) => {
    //esempio chiamata dal frontend di react nativo
    //const response = await fetch("http://localhost:3000/api/books?page=3&limit=5");
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 2;
        const skip = (page -1) * limit;

        const books = await Book.find()
        .sort({createdAt: -1}) //ordine decrescente
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage"); 

        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.log("Errore nel percorso 'Tutti i libri'", error);
        res.status(500).json({message: "Errore interno del server"});
    }
})

//Libri raccomandati da un utente loggato
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);
    } catch (error) {
        console.error("Errore durante il recupero dei libri", error.message);
        res.status(500).json({message: "Errore del Server"});
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(400).json({message: "Libro non trovato"});

        //controlla se l'utente è il creatore del libro
        if (book.user.toString() !== req.user._id.toString())
            return res.status(401).json({message: "Non autorizzato"});

        // eliminare l'immagine nel database
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Errore nel cancellare l'immagine da Cloudinary", deleteError)
            }
        };

        await book.deleteOne();

        res.json({message: "Libro eliminato con successo"});

    } catch (error) {

        console.log("Errore nel cancellare il libro");
        res.status(500).json({message: "Errore interno del server"});
    }
})

export default router;