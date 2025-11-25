// Minimal Kafka consumer worker for telemetry.raw topic
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'telemetry-worker',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'telemetry-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'telemetry.raw', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()}`);
    },
  });
}

run().catch(console.error);
