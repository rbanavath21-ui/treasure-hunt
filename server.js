const express = require('express');
const session = require('express-session'); // <--- ADDED
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// <--- ADDED: THE SECURE SESSION ENGINE --->
app.use(session({
    secret: 'enigma_hacker_secret_key_2026', 
    resave: false,
    saveUninitialized: true
}));

// MongoDB Connection (Commented out until we create the .env file)
/*
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.log('Database connection error: ', err));
*/

// --- THE ENIGMA PROTOCOL: TREASURE HUNT ---
const riddles = [
    // --- Levels 1-6 (Mapped from reference image) ---
    // Node 1: Riddle Cave (Candle)
    { 
        stepNumber: 1, 
        label: "Riddle Cave", 
        icon: "🕯️", 
        question: "Elephant-headed Lord of Beginnings, the remover of obstacles. Who is he?", 
        answer: ["ganesha", "ganesh", "vinayaka", "vinayakudu"],
        hint: "Son of Shiva and Parvati."
    },
    // Node 2: Fun Puzzle Island (Palm Island)
    { 
        stepNumber: 2, 
        label: "Fun Puzzle Island", 
        icon: "🏝️", 
        question: "Lord Ganesha's traditional vehicle...", 
        answer: "mouse",
        hint: "Eats cheese, gets chased by cats."
    },
    // Node 3: Image Mystery Forest (Pine Tree)
    { 
        stepNumber: 3, 
        label: "Image Mystery Forest", 
        icon: "🌲", 
        question: "Engelbart invented computer hardware...", 
        answer: "mouse",
        hint: "You click it."
    },
    // Node 4: Word Decoder Temple (Temple)
    { 
        stepNumber: 4, 
        label: "Word Decoder Temple", 
        icon: "🏛️", 
        question: "blinking indicator on your screen...", 
        answer: "cursor",
        hint: "shows where you type."
    },
    // Node 5: Logic Dungeon (Cog Gear)
    { 
        stepNumber: 5, 
        label: "Logic Dungeon", 
        icon: "⚙️", 
        question: "AI code editor 'Cursor' fork...", 
        answer: "vscode",
        hint: "Visual Studio ____"
    },
    // Node 6: Extended Map (Extended for 10-step total)
    { 
        stepNumber: 6, 
        label: "Gem Cavern", 
        icon: "💎", 
        question: "Google's flagship AI model...", 
        answer: "gemini",
        hint: "constellation."
    },

    // --- Levels 7-10 (Device new fantasy-themed labels) ---
    // Node 7: Extended Map
    { 
        stepNumber: 7, 
        label: "Map Chamber", 
        icon: "🗺️", 
        question: "Gemini zodiac sign Castor and Pollux...", 
        answer: "twins",
        hint: "siblings born at exact same time."
    },
    // Node 8: Extended Map
    { 
        stepNumber: 8, 
        label: "Scroll Library", 
        icon: "📜", 
        question: "Riddle: twins on opposite sides of bridge...", 
        answer: "eyes",
        hint: "use them to read this."
    },
    // Node 9: Extended Map
    { 
        stepNumber: 9, 
        label: "Coin Treasury", 
        icon: "💰", 
        question: "colored part of this organ...", 
        answer: "iris",
        hint: "controls pupil size."
    },
    // Node 10: Final Treasure (Crown)
    { 
        stepNumber: 10, 
        label: "Final Treasure", 
        icon: "👑", 
        question: "biometric scanner fingerprint or...", 
        answer: "iris",
        hint: "Eye scanner."
    }
];

// Set global variable for EJS templates
app.locals.totalSteps = riddles.length;
app.locals.riddles = riddles;
// --- ROUTES ---

// 1. The Home / Landing Page
// 1. The Secure Home Page
app.get('/', (req, res) => {
    // When they hit start, the server secretly creates a file for them
    req.session.currentStep = 1;
    req.session.previousStep = 1;
    req.session.attempts = 3;
    req.session.passedHint = null;
    res.render('index', { startScreen: true }); 
});

// 2. The Secure Map Screen
app.get('/map', (req, res) => {
    if (!req.session.currentStep) return res.redirect('/'); // Kick out hackers bypassing the start screen

    if (req.session.currentStep > riddles.length) {
        return res.render('index', { victory: true });
    }

    res.render('index', { 
        mapScreen: true, 
        currentStep: req.session.currentStep, 
        previousStep: req.session.previousStep, 
        passedHint: req.session.passedHint
    });
});

// 3. The Secure Play Route (No more /:step in the URL!)
app.get('/play', (req, res) => {
    if (!req.session.currentStep) return res.redirect('/');
    
    const riddle = riddles.find(r => r.stepNumber === req.session.currentStep);
    res.render('index', { 
        riddle: riddle, 
        passedHint: req.session.passedHint,
        attempts: req.session.attempts 
    }); 
});

// 4. The Secure Verify Route
app.post('/verify', (req, res) => {
    if (!req.session.currentStep) return res.redirect('/');

    const userAnswer = req.body.userAnswer.trim().toLowerCase(); // We ONLY trust the typed answer now
    const currentStep = req.session.currentStep;
    const currentRiddle = riddles.find(r => r.stepNumber === currentStep);

    let isCorrect = false;
    let actualAnswer = "";

    if (Array.isArray(currentRiddle.answer)) {
        isCorrect = currentRiddle.answer.includes(userAnswer);
        actualAnswer = currentRiddle.answer[0]; 
    } else {
        isCorrect = (userAnswer === currentRiddle.answer);
        actualAnswer = currentRiddle.answer;
    }

    if (isCorrect) {
        req.session.previousStep = currentStep;
        req.session.currentStep += 1;
        req.session.passedHint = actualAnswer.toUpperCase();
        req.session.attempts = 3; // Reset lives for the next level
        res.redirect('/map');
    } else {
        // WRONG ANSWER LOGIC
        req.session.attempts -= 1; 
        
        if (req.session.attempts <= 0) {
            req.session.attempts = 3; // Reset lives so they can try again
            res.render('index', { systemCrash: true, currentStep: currentStep });
        } else {
            res.render('index', { 
                riddle: currentRiddle, 
                error: "ACCESS DENIED.", 
                passedHint: req.session.passedHint, 
                attempts: req.session.attempts 
            });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});