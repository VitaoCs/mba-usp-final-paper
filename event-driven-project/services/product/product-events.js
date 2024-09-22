const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
const producer = new Producer(client);

exports.init = () => {
    producer.on('ready', () => {
        console.log('Kafka Producer is ready for product events');
    });

    producer.on('error', (err) => {
        console.error('Kafka Producer error:', err);
    });
};

exports.emitProductCreated = (product) => {
    const payloads = [{
        topic: 'product-events',
        messages: JSON.stringify({ type: 'PRODUCT_CREATED', payload: product })
    }];
    producer.send(payloads, (err, data) => {
        if (err) {
            console.error('Error sending Kafka message:', err);
        } else {
            console.log('Kafka message sent:', data);
        }
    });
};

exports.emitProductUpdated = (product) => {
    const payloads = [{
        topic: 'product-events',
        messages: JSON.stringify({ type: 'PRODUCT_UPDATED', payload: product })
    }];
    producer.send(payloads, (err, data) => {
        if (err) {
            console.error('Error sending Kafka message:', err);
        } else {
            console.log('Kafka message sent:', data);
        }
    });
};

exports.emitProductDeleted = (productId) => {
    const payloads = [{
        topic: 'product-events',
        messages: JSON.stringify({ type: 'PRODUCT_DELETED', payload: { id: productId } })
    }];
    producer.send(payloads, (err, data) => {
        if (err) {
            console.error('Error sending Kafka message:', err);
        } else {
            console.log('Kafka message sent:', data);
        }
    });
};