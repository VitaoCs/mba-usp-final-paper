const kafka = require('kafka-node');
const Order = require('./order-model'); // Import your Order model

const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
const consumer = new Consumer(
  client,
  [
    { topic: 'product-events', partition: 0 },
    { topic: 'user-events', partition: 0 }
  ],
  { autoCommit: true }
);

const Producer = kafka.Producer;
const producer = new Producer(client);

exports.init = () => {
  consumer.on('message', async (message) => {
    const event = JSON.parse(message.value);
    console.log('Received event:', event);

    switch (event.type) {
      case 'PRODUCT_UPDATED':
        await handleProductUpdated(event.payload);
        break;
      case 'PRODUCT_DELETED':
        await handleProductDeleted(event.payload);
        break;
      case 'USER_UPDATED':
        await handleUserUpdated(event.payload);
        break;
      case 'USER_DELETED':
        await handleUserDeleted(event.payload);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
  });

  consumer.on('error', (err) => {
    console.error('Kafka Consumer error:', err);
  });

  producer.on('ready', () => {
    console.log('Kafka Producer is ready for order events');
  });

  producer.on('error', (err) => {
    console.error('Kafka Producer error:', err);
  });
};

// Event handler functions
async function handleProductUpdated(product) {
  try {
    // Find all orders containing the updated product
    const orders = await Order.find({ 'products.product': product._id });

    for (const order of orders) {
      // Update product price in the order
      const productInOrder = order.products.find(p => p.product.equals(product._id));
      if (productInOrder) {
        productInOrder.price = product.price;

        // Recalculate order total
        order.totalPrice = order.products.reduce((total, p) => total + (p.price * p.quantity), 0);

        await order.save();
      }
    }
  } catch (err) {
    console.error('Error handling PRODUCT_UPDATED event:', err);
  }
}

async function handleProductDeleted(product) {
  try {
    // Find all orders containing the deleted product
    const orders = await Order.find({ 'products.product': product.id });
    for (const order of orders) {
      // Remove the deleted product from the order, handling null p.product
      order.products = order.products.filter(p => p.product && !p.product.equals(product.id));

      // If the order is now empty, delete it
      if (order.products.length === 0) {
        await Order.deleteOne({ _id: order._id });;
      } else {
        // Recalculate order total
        order.totalPrice = order.products.reduce((total, p) => total + (p.price * p.quantity), 0);

        await order.save();
      }
    }
  } catch (err) {
    console.error('Error handling PRODUCT_DELETED event:', err);
  }
}

async function handleUserUpdated(user) {
  try {
    // Update user information in all orders associated with the user
    await Order.updateMany({ user: user._id }, { $set: { user: user } });
  } catch (err) {
    console.error('Error handling USER_UPDATED event:', err);
  }
}

async function handleUserDeleted(user) {
  try {
    // Delete all orders associated with the deleted user
    await Order.deleteMany({ user: user.id });
  } catch (err) {
    console.error('Error handling USER_DELETED event:', err);
  }
}

// Event emission functions
exports.emitOrderCreated = (order) => {
  const payloads = [{
    topic: 'order-events',
    messages: JSON.stringify({ type: 'ORDER_CREATED', payload: order })
  }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending Kafka message:', err);
    } else {
      console.log('Kafka message sent:', data);
    }
  });
};

exports.emitOrderUpdated = (order) => {
  const payloads = [{
    topic: 'order-events',
    messages: JSON.stringify({ type: 'ORDER_UPDATED', payload: order })
  }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending Kafka message (ORDER_UPDATED):', err);
    } else {
      console.log('Kafka message sent (ORDER_UPDATED):', data);
    }
  });
};

exports.emitOrderDeleted = (orderId) => {
  const payloads = [{
    topic: 'order-events',
    messages: JSON.stringify({ type: 'ORDER_DELETED', payload: { id: orderId } })
  }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending Kafka message (ORDER_DELETED):', err);
    } else {
      console.log('Kafka message sent (ORDER_DELETED):', data);
    }
  });
};