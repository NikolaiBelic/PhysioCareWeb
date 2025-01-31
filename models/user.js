const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, 'User is required'],
        minlength: [4, 'User must be at least 4 characters'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [7, 'Password must be at least 7 characters']
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'physio', 'patient']
    }
});

let User = mongoose.model('users', userSchema);

module.exports = User;

