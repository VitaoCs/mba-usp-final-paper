const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String
  // ... other user fields
});

module.exports = mongoose.model('User', userSchema);