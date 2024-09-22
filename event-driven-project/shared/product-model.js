const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  // ... other product fields
});

module.exports = mongoose.model('Product', productSchema);