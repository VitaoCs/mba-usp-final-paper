const Order = require('./shared/order-model');
const Product = require('./shared/product-model')

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('products.product'); 
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('products.product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body
    const productPrices = await Promise.all(
      products.map(async (productElement) => {
        const product = await Product.findById(productElement.product);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        return product.price * productElement.quantity;
      })
    );

    const totalPrice = productPrices.reduce((acc, curr) => acc + curr, 0);
    const orderObj = {
      totalPrice,
      status: 'CREATED',
      ...req.body
    }
    const order = new Order(orderObj);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};