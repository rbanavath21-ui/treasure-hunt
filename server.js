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

// --- THE ENIGMA MIXED CHAIN ---
const riddles = [
    // --- INDIAN MYTHOLOGY ---
    { 
        stepNumber: 1, 
        question: "He is the elephant-headed Lord of Beginnings, the remover of obstacles. Who is he?", 
        // FIX: Use an array to allow multiple acceptable answers
        answer: ["ganesha", "ganesh", "vinayaka", "vinayakudu"],
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

// Set global variable for EJS templates
app.locals.totalSteps = riddles.length;

// --- ROUTES ---

// 1. The Home / Landing Page
app.get('/', (req, res) => {
    res.render('index', { startScreen: true }); 
});

// 2. The Saga Map Screen Route
app.get('/map', (req, res) => {
    const step = parseInt(req.query.step) || 1;
    const prevStep = parseInt(req.query.prev) || step; 
    const hint = req.query.hint || null;

    if (step > riddles.length) {
        return res.render('index', { victory: true });
    }

    res.render('index', { 
        mapScreen: true, 
        currentStep: step, 
        previousStep: prevStep, 
        passedHint: hint
    });
});

// 3. The Route to load a specific question
app.get('/play/:step', (req, res) => {
    const step = parseInt(req.params.step);
    const riddle = riddles.find(r => r.stepNumber === step);
    
    res.render('index', { 
        riddle: riddle, 
        passedHint: req.query.hint 
    }); 
});

// 4. The Verify Route (Cleaned up!)
app.post('/verify', (req, res) => {
    const userStep = parseInt(req.body.stepNumber);
    const userAnswer = req.body.userAnswer.trim().toLowerCase();
    const passedHint = req.body.passedHint;
    
    const currentRiddle = riddles.find(r => r.stepNumber === userStep);

    // FIX: Check if the answer is an Array (like Ganesha) or a single String
    let isCorrect = false;
    let actualAnswer = "";

    if (Array.isArray(currentRiddle.answer)) {
        isCorrect = currentRiddle.answer.includes(userAnswer);
        actualAnswer = currentRiddle.answer[0]; // Grab the first one to use as the hint
    } else {
        isCorrect = (userAnswer === currentRiddle.answer);
        actualAnswer = currentRiddle.answer;
    }

    if (isCorrect) {
        const nextStep = userStep + 1;
        const newHintText = actualAnswer.toUpperCase();
        res.redirect(`/map?step=${nextStep}&hint=${newHintText}&prev=${userStep}`);
    } else {
        res.render('index', { riddle: currentRiddle, error: "ACCESS DENIED.", passedHint: passedHint });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});