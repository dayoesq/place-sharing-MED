const fs = require('fs');
const HttpError = require('../models/http-errors');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const getCoordsForAddress = require('../util/location');
const catchAsync = require('../util/catch-async');
const User = require('../models/user');
const Place = require('../models/place');

exports.getPlaceById = catchAsync (async (req, res, next) => {
  const placeId = req.params.pid;
  const place = await Place.findById(placeId);
  if (!place) {
    return next(new HttpError('The place could not found', 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
});

exports.getPlacesByUserId = catchAsync( async (req, res, next) => {
  const userId = req.params.uid;
  const places = await Place.find({creator: userId});
  if (!places) {
    return next(new HttpError('There are no places with the provided id', 404));
  }
  res.json({ places: places.map(place => place.toObject({getters: true }))});
});

exports.createPlace = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }
  const { title, description, address } = req.body;
  let coordinates;

  coordinates = await getCoordsForAddress(address);

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId
  });
  // Check for the creator id before persisting data
  let user;
  user = await User.findById(req.userData.userId);
  if (!user) {
    return next(new HttpError('Could not find the user', 404)); 
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  await createdPlace.save({ session });
  await user.places.push(createdPlace); // The push method is from mongoose
  await user.save({ session });
  await session.commitTransaction();
  if (!createdPlace) return next(new HttpError('Could not create place', 500));
  res.status(201).json({ place: createdPlace });
});

// Update place 
exports.updatePlace = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const placeId = req.params.pid;
  let place;
  place = await Place.findById(placeId);
  if (!place) return next(new HttpError('Could not find the place', 404));
  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowded to edit this place', 401));
  }

  if (!req.body.title || !req.body.description) {
    return next(new HttpError('Only title and description can be updated', 400));
  }

  place.title = req.body.title;
  place.description = req.body.description;

  const updatedPlace = await place.save();

  if (!updatedPlace) return next(new HttpError('Could not update place', 500));

  res.status(200).json({ place: updatedPlace });
});

// Delete place 
exports.deletePlace = catchAsync( async(req, res, next) => {
  const placeId = req.params.pid;
  const place = await Place.findById(placeId).populate('creator');
  if (!place) return next(new HttpError('Place could not be found', 404));
   if (place.creator.id !== req.userData.userId) {
    return next(new HttpError('Operation not allowed', 403));
  }
  const imagePath = place.image;

  const session = await mongoose.startSession();
  session.startTransaction();
  await place.deleteOne({ session });
  await place.creator.places.pull(place); 
  await place.creator.save({ session });
  await session.commitTransaction();
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: 'Deleted place.' });
});

