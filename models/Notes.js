const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotesSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true // extra spaces ko remove kar deta hai
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tag: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

// export the model
module.exports = mongoose.model('Notes', UserSchema);