const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema2 = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true 
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema2);