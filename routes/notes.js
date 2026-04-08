const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ye hamai us user data ko access karne me madad karega jo already login ho chuka hai, kyunki jab user login karega to uska data JWT token me store ho jayega

// ROUTE 1: Get all the Notes using: GET "/api/notes/fetchallnotes" . login Required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        // .sort({ date: -1 }) descending order me sort karenge, yani ke sabse naye note pehle aayega
        const notes = await Note.find({ user: req.user.id }).sort({ date: -1 }); // Note model me se user ke id ke hisab se notes find karenge 
        res.json(notes); // notes ko json format me response me bhej denge

    } catch (error) { // → agar error aaye to handle karo
        console.error(error.message); // specially errors ke liye use hota hai (debugging ke liye)
        res.status(500).send("Some Error Occured"); // jab code crash ho = 👉 user ko generic error message bhej diya
    }
});


// ROUTE 2: Add a new note using: GET "/api/notes/addnote" . login Required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, description, tag } = req.body; // request body se title, description aur tag ko extract karenge

            // agar errors hon to array me send karo aor aage work nahi karo
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const note = new Note({
                title, description, tag, user: req.user.id // user: req.user.id ka matlab hai ke note ko us user ke id ke sath link karenge jo note create kar raha hai
            })
            const savedNote = await note.save(); // note ko database me save karenge

            res.json(savedNote); // savedNote ko json format me response me bhej denge

        } catch (error) {
            console.error(error.message); // specially errors ke liye use hota hai (debugging ke liye)
            res.status(500).send("Internal Server Error Occured"); // jab code crash ho = 👉 user ko generic error message bhej diya
        }
    });

// ROUTE 3: Update an existing Note using: PUT "/api/notes/updatenote" . login Required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body; // request body se title, description aur tag ko extract karenge`

    try {
        const newNote = {}; // create a newNote object to store the updated fields
        if (title) { newNote.title = title; } // newNote object me title field ko update karenge
        if (description) { newNote.description = description; }
        if (tag) { newNote.tag = tag; }

        // Find the note to be updated and update it`
        let note = await Note.findById(req.params.id); // note ko uske id ke hisab se find karenge
        if (!note) { return res.status(404).send("Not Found!") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed!")
        }

        // $set operator sirf un fields ko update karta hai jo "newNote" object me hain
        // { new: true } option ka matlab hai ke updated note ko return karenge, na ke purane note ko
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error Occured");
    }

});


// ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote" . login Required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it`
        let note = await Note.findById(req.params.id); // note ko uske id ke hisab se find karenge
        if (!note) { return res.status(404).send("Not Found!") }

        // Allows deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {  // agar note ka user id aur request me user id match nahi to delete ki permission nahi denge
            return res.status(401).send("Not Allowed!")
        }

        note = await Note.findByIdAndDelete(req.params.id);  // note ko uske id ke hisab se delete karenge
        res.json({ "Success": "Note has been deleted!", note: note }); // delete hone ke baad ek success message aur delete hua note ko json format me response me bhej denge

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error Occured");
    }

});


module.exports = router;