const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true // extra spaces ko remove kar deta hai
    },
    email: {
        type: String,
        required: true,
        // unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

// export the model
const User = mongoose.model('User', UserSchema);
User.createIndexes(); 
module.exports = User;