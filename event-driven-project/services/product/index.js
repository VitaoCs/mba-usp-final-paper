const express = require('express');
const mongoose = require('mongoose');
const productController = require('./product-controller');
const productEvents = require('./product-events');

const app = express();
const PORT = 3001;

mongoose.connect('mongodb://mongodb:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.get('/products', productController.getAllProducts);
app.get('/products/:id', productController.getProductById);
app.post('/products', productController.createProduct);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);

// Initialize Kafka event handling
productEvents.init();

app.listen(PORT, () => {
  console.log(`Product service listening on port ${PORT}`);
});