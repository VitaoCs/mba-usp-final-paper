const express = require('express');
const mongoose = require('mongoose');
const orderController = require('./order-controller');

const app = express();
const PORT = 3002;

mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.get('/orders', orderController.getAllOrders);
app.get('/orders/:id', orderController.getOrderById);
app.post('/orders', orderController.createOrder);
app.put('/orders/:id', orderController.updateOrder);
app.delete('/orders/:id', orderController.deleteOrder);

app.listen(PORT, () => {
  console.log(`Order service listening on port ${PORT}`);
});