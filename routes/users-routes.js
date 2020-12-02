const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const fileUpload = require('../middlewares/file-upload');

const { getUsers, signup, login } = require('../controllers/users-controller');
router.get('/', getUsers);
// Signup route with validation check
router.post('/signup',
  fileUpload.single('image'),
  [
    check('name').trim().isLength({ min: 2 }),
    check('email').trim().normalizeEmail().isEmail(),
    check('password').trim().isLength({min: 6})
  ],
  signup);
router.post('/login', login);


module.exports = router;