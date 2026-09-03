require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.static(path.join(__dirname)));
// Increased limits for Base64 PDF uploads
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scb_project';
console.log('⏳ Connecting to MongoDB at', dbURI);
mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// --- SCHEMAS ---
const Event = mongoose.model('Event', new mongoose.Schema({
    eventDate: String,
    eventTitle: String,
    eventDetails: String
}));

const Timetable = mongoose.model('Timetable', new mongoose.Schema({
    year: String,
    semester: String,
    Date: Date,
    slot: String,
    subject: String
}));

const Complaint = mongoose.model('Complaint', new mongoose.Schema({
    name: String,
    location: String,
    issue: String,
    createdAt: { type: Date, default: Date.now }
}));

const Feedback = mongoose.model('Feedback', new mongoose.Schema({
    name: String,
    rating: String,
    comments: String,
    createdAt: { type: Date, default: Date.now }
}));

const AquaPulse = mongoose.model('AquaPulse', new mongoose.Schema({
    location: String,
    issue: String,
    reportedBy: String,
    createdAt: { type: Date, default: Date.now }
}));

const Note = mongoose.model('Note', new mongoose.Schema({
    title: String,
    description: String,
    uploadedBy: String,
    subject: String,
    type: String,
    year: String,
    semester: String,
    fileUrl: String, 
    createdAt: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. Timetable Routes
app.get('/api/timetable', async (req, res) => {
    try {
        const data = await Timetable.find().sort({ Date: 1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/timetable', async (req, res) => {
    try {
        const newEntry = new Timetable(req.body);
        await newEntry.save();
        res.status(201).json({ message: "Timetable Saved!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Events Routes
app.get('/api/events', async (req, res) => {
    try {
        const data = await Event.find();
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/events', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json({ message: "Event Saved!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Complaint Routes
app.get('/api/complaints', async (req, res) => {
    try {
        const data = await Complaint.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/complaints', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.status(201).json({ message: "Complaint Submitted!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Notes Corner Routes
app.get('/api/notescorner', async (req, res) => {
    try {
        const data = await Note.find().sort({ createdAt: -1 });
        console.log("Notes sent to frontend:", data); 
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/notescorner', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json({ message: "Note Saved!" });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Feedback Routes ---
app.get('/api/feedback', async (req, res) => {
    try {
        const data = await Feedback.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json({ message: "Feedback Saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AquaPulse Routes ---
app.get('/api/aquapulse', async (req, res) => {
    try {
        const data = await AquaPulse.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/aquapulse', async (req, res) => {
    try {
        const newReport = new AquaPulse(req.body);
        await newReport.save();
        res.status(201).json({ message: "AquaPulse report saved." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE ROUTES ---

app.delete('/api/timetable/:id', async (req, res) => {
    try {
        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/complaints/:id', async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Added this missing delete route for Notes!
app.delete('/api/notescorner/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- START SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});