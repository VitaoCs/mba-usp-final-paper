const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
const producer = new Producer(client);

exports.init = () => {
  producer.on('ready', () => {
    console.log('Kafka Producer is ready for user events');
  });

  producer.on('error', (err) => {
    console.error('Kafka Producer error:', err);
  });
};

exports.emitUserCreated = (user) => {
  const payloads = [{
    topic: 'user-events',
    messages: JSON.stringify({ type: 'USER_CREATED', payload: user })
  }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending Kafka message:', err);
    } else {
      console.log('Kafka message sent:', data);
    }
  });
};

exports.emitUserUpdated = (user) => {
  const payloads = [{
    topic: 'user-events',
    messages: JSON.stringify({ type: 'USER_UPDATED', payload: user })
  }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending Kafka message:', err);
    } else {
      console.log('Kafka message sent:', data);
    }
  });
};

exports.emitUserDeleted = (userId) => {
  const payloads = [{
    topic: 'user-events',
    messages: JSON.stringify({ type: 'USER_DELETED', payload: { id: userId } })
  }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending Kafka message:', err);
    } else {
      console.log('Kafka message sent:', data);
    }
  });
};