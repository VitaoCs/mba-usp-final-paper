const mongoose = require('mongoose');
const User = require('./user-model')
const Product = require('./product-model')

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Product
    },
    quantity: Number
  }],
  status: String,
  totalPrice: Number
});

module.exports = mongoose.model('Order', orderSchema);