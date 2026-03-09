require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (like your CSS and images) from the 'public' folder
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// MongoDB Connection (Commented out until we create the .env file)
/*
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.log('Database connection error: ', err));
*/

// Basic Test Route
// --- DUMMY DATA (No extra hint field needed!) ---
// --- THE RIDDLE CHAIN ---
// Notice how the answer to each question is the direct subject of the next question!
// --- THE RIDDLE CHAIN ---
// --- THE ENIGMA MIXED CHAIN ---
const riddles = [
    // --- INDIAN MYTHOLOGY ---
    { 
        stepNumber: 1, 
        question: "He is the elephant-headed Lord of Beginnings, the remover of obstacles. Who is he?", 
        answer: "ganesha" || "ganesh" || "vinayaka" || "vinayakudu",
        hint: "Son of Shiva and Parvati."
    },
    { 
        stepNumber: 2, 
        question: "Lord Ganesha's traditional vehicle (vahana) is Mooshika, which is what small, scurrying animal?", 
        answer: "mouse",
        hint: "Eats cheese, gets chased by cats."
    },
    
    // --- TECH & CODING ---
    { 
        stepNumber: 3, 
        question: "In 1968, Douglas Engelbart invented a computer hardware device that shares its name with that exact animal. What is it?", 
        answer: "mouse",
        hint: "You click it."
    },
    { 
        stepNumber: 4, 
        question: "When you move that device on your desk, what specific blinking or solid indicator moves on your screen?", 
        answer: "cursor",
        hint: "It shows where you are about to type."
    },
    { 
        stepNumber: 5, 
        question: "There is an AI code editor named 'Cursor' that is built as a fork of which incredibly popular Microsoft code editor?", 
        answer: "vscode",
        hint: "Visual Studio ____"
    },

    // --- CURRENT AFFAIRS / AI ---
    { 
        stepNumber: 6, 
        question: "If you don't know how to write code in VS Code, you might ask an AI for help in 2026. What is the name of Google's flagship AI model?", 
        answer: "gemini",
        hint: "Named after a constellation."
    },

    // --- ASTROLOGY & RIDDLES ---
    { 
        stepNumber: 7, 
        question: "In astrology, the Gemini zodiac sign is represented by Castor and Pollux, who share what specific sibling relationship?", 
        answer: "twins",
        hint: "Two siblings born at the exact same time."
    },
    { 
        stepNumber: 8, 
        question: "Riddle: We are twins sitting on opposite sides of a bridge. We see everything, but we never see each other. What are we?", 
        answer: "eyes",
        hint: "You use them to read this."
    },

    // --- BIOLOGY & TECH ---
    { 
        stepNumber: 9, 
        question: "The colored part of this organ is named after the Greek goddess of the rainbow. What is it called?", 
        answer: "iris",
        hint: "It controls the size of your pupil."
    },
    { 
        stepNumber: 10, 
        question: "To secure a top-secret physical facility, you might use a biometric scanner that scans either your fingerprint or your...", 
        answer: "iris",
        hint: "Eye scanner."
    }
];

// --- ROUTES ---
// 1. The Home / Landing Page
app.get('/', (req, res) => {
    // Pass a flag to tell the frontend to show the Start Screen
    res.render('index', { startScreen: true }); 
});

// 2. The Route to Start the Game
app.get('/play', (req, res) => {
    // Load the first riddle when they click "Initialize"
    res.render('index', { riddle: riddles[0] }); 
});

app.post('/verify', (req, res) => {
    const userStep = parseInt(req.body.stepNumber);
    const userAnswer = req.body.userAnswer.trim().toLowerCase();
    
    const currentRiddle = riddles.find(r => r.stepNumber === userStep);

    if (userAnswer === currentRiddle.answer) {
        // Correct Answer! 
        const nextRiddle = riddles.find(r => r.stepNumber === userStep + 1);
        
        if (nextRiddle) {
            // Still playing: Pass the user's successful answer forward as the hint!
            res.render('index', { 
                riddle: nextRiddle, 
                message: `Correct! Your hint is: ${currentRiddle.answer.toUpperCase()}` 
            });
        } else {
            // THEY WON! No more riddles in the array. Pass the victory flag.
            res.render('index', { victory: true });
        }
    } else {
        // WRONG ANSWER! Reload the page with an error message.
        res.render('index', { 
            riddle: currentRiddle, 
            error: "ACCESS DENIED: Incorrect solution." 
        });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});