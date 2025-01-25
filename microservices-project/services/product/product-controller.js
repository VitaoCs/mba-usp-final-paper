const axios = require('axios')
const Product = require('./shared/product-model');
const Order = require('./shared/order-model');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find all orders containing the updated product
    const orders = await Order.find({ 'products.product': product._id });

    for (const order of orders) {
      // Update product price in the order
      const productInOrder = order.products.find(p => p.product.equals(product._id));
      if (productInOrder) {
        productInOrder.price = product.price;

        // Recalculate order total
        order.totalPrice = order.products.reduce((total, p) => total + (p.price * p.quantity), 0);
        const response = await axios.put(`http://order-service:3002/orders/${order._id}`, order);
        if (response.status !== 200) {
          throw new Error(`Error updating order ${order._id}:`, response.data)
        }
      }
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find all orders containing the deleted product
    const orders = await Order.find({ 'products.product': productId });

    for (const order of orders) {
      // Remove the deleted product from the order
      order.products = order.products.filter(p => p.product && !p.product.equals(productId));

      // If the order is now empty, delete it
      if (order.products.length === 0) {
        const response = await axios.delete(`http://order-service:3002/orders/${order._id}`);
        if (response.status !== 200) {
          throw new Error(`Error deleting order ${order._id}:`, response.data)
        }
      } else {
        // Recalculate and update order total before calling axios.put
        order.totalPrice = await order.products.reduce(async (total, p) => {
          const { price } = await Product.findById(p.product)
          return total + (price * p.quantity)
        }, 0);

        const response = await axios.put(`http://order-service:3002/orders/${order._id}`, order);
        if (response.status !== 200) {
          throw new Error(`Error updating order ${order._id}:`, response.data);
        }
      }
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};