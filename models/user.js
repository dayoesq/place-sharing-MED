const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name is required'],
    trim: true,
    minlength: [2, 'The name is too short'],
    maxlength: [60, 'The name is too long']
  },
  email: {
    type: String,
    required: [true, 'The email is required'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [6, 'The password is too short'],
    maxlength: [100, 'The password is too long']
  },
  image: {
    type: String,
    required: true
  },
  places: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: [true, 'The place is required']
    }
  ]
});

const User = mongoose.model('User', userSchema);
module.exports = User;