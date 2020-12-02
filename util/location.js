const axios = require('axios');
const HttpError = require('../models/http-errors');
// const API_KEY = 'AIzaSyBUzZ8tuD7XTjdoRyI7EX8Ow2VM7ojA9_0';

// Get address with goodle geolocation API
// You should replace the token with yours!

const getCoordsForAddress = async (address) => {
  const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`);
  const data = res.data;
  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Could not find location with the specified address', 404);
    throw error;
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
};

module.exports = getCoordsForAddress;