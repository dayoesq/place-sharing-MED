const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'The title is required'],
    minlength: [4, 'The title is too short'],
    maxlength: [200, 'The title is too long'],
    trim: true
  },
  description: {
    type: String,
    minlength: [1, 'The description is too short'],
    maxlength: [2000, 'The description is too long'],
    trim: true,
    required: [true, 'The description is required']
  },
  image: String,
  address: {
    type: String,
    minlength: [1, 'The description is too short'],
    maxlength: [200, 'The description is too long'],
    trim: true,
    required: [true, 'The description is required']
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'The creator is required']
  }
});

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;

