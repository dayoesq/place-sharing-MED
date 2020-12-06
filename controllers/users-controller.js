const HttpError = require('../models/http-errors');
const { validationResult } = require('express-validator');
const catchAsync = require('../util/catch-async');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.signup = catchAsync(async (req, res, next) => {
 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check input(s)', 422));
  }
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return next(new HttpError('User already exists', 422));
  }
  let hashedPassword;
  hashedPassword = await bcrypt.hash(password, 12);
  if (!hashedPassword) return next(new HttpError('User could not be created', 500));

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places:[]
  });
  const createdUser = await newUser.save();
  if (!createdUser) {
    return next(new HttpError('Could not create user, please try again later', 500));
  }
  // Generate token
   let token;
  token = jwt.sign({ email: email, userId: createdUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP
  });
  if (!token) return next(new HttpError('Sorry, token could not be created', 500));
  res.status(201).json({
    userId: createdUser.id, email: createdUser.email, token: token
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check input(s)', 422));
  }
  let { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new HttpError('No user with the provided email', 404));
  } else {
    password = await bcrypt.compare(password, user.password);
  }
  if (!password) {
    return next(new HttpError('Invalid password, please check your password and try again', 400));
  }
  // Generate token 
  let token;
  token = jwt.sign({ email: email, userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP
  });
  if (!token) return next(new HttpError('Sorry, token could not be created', 500));

  res.json({ userId: user.id, email: user.email, token: token });
});

exports.getUsers = catchAsync(async(req, res, next) => {
  const users = await User.find({}, '-password');
  if (!users) {
    return next (new HttpError('Something went wrong, try again later', 500));
  }
  res.json({ users: users.map( user => user.toObject({ getters: true }))});
});
