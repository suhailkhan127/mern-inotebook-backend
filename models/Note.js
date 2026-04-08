const mongoose = require('mongoose');
const { Schema } = mongoose;
 
const NoteSchema = new Schema({

    // Foreign Key (ObjectId) = Do tables ke beech mein "link" jo batata hai ke yeh record us table ke kis record se related hai.
    user:{
        type: mongoose.Schema.Types.ObjectId, // Foreign Key (ObjectId) = user ka id store karne ke liye ObjectId type use karenge
        ref: 'user'
    },

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
module.exports = mongoose.model('Note', NoteSchema);