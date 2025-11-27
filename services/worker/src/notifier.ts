import axios from 'axios';

export async function sendNotification(alert: any, state: 'triggered' | 'resolved', result: any) {
  const message = {
    text: `Alert: ${alert.name} (${alert.type})\nState: ${state}\nQuery: ${
      alert.query
    }\nThreshold: ${alert.threshold}\nResult: ${JSON.stringify(result)}`,
  };
  for (const channel of alert.channels) {
    if (channel === 'slack' && alert.slackWebhookUrl) {
      await axios.post(alert.slackWebhookUrl, message);
    }
    if (channel === 'webhook' && alert.webhookUrl) {
      await axios.post(alert.webhookUrl, message);
    }
    if (channel === 'email' && alert.email) {
      // Implement email sending logic here (SMTP or service)
    }
  }
}
