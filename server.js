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
app.get('/', (req, res) => {
    res.render('index', { startScreen: true }); 
});

// 2. The Treasure Map Screen Route
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
        passedHint: req.query.hint,
        // Give the player 3 attempts when they load the level
        attempts: 3 
    }); 
});

// 4. The Verify Route (Thematic error screen)
app.post('/verify', (req, res) => {
    const userStep = parseInt(req.body.stepNumber);
    const userAnswer = req.body.userAnswer.trim().toLowerCase();
    const passedHint = req.body.passedHint;
    
    // NEW: Get current attempts from the hidden form input (default to 3 if missing)
    let attempts = parseInt(req.body.attempts) || 3; 
    
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
        // WRONG ANSWER LOGIC (SYSTEM INTEGRITY)
        attempts -= 1; 
        
        if (attempts <= 0) {
            // Out of lives! Send the crash screen
            res.render('index', { systemCrash: true, currentStep: userStep });
        } else {
            // Still have lives, reload the level with an error and updated attempts
            res.render('index', { 
                riddle: currentRiddle, 
                error: "ACCESS DENIED.", 
                passedHint: passedHint, 
                attempts: attempts 
            });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});