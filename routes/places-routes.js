const express = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middlewares/check-auth');
const router = express.Router();

const fileUpload = require('../middlewares/file-upload');

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/places-controller');
router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);
router.use(checkAuth);
// The post method uses express-validator 
router.post('/',
  fileUpload.single('image'),
  [
    check('title').trim().notEmpty(),
    check('description').trim().isLength({ min: 5 }),
    check('address').trim().notEmpty()
  ],
  createPlace);
router.patch('/:pid',
  [
    check('title').trim().notEmpty(),
    check('description').trim().notEmpty()
  ],
  updatePlace);
router.delete('/:pid', deletePlace);


module.exports = router;