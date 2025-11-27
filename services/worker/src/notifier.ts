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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a2160cb (chore(security): remove personal and global secrets, refactor alert notification for multi-user production support)
    if (channel === 'email' && Array.isArray(alert.emails)) {
      for (const email of alert.emails) {
        // Implement email sending logic here (SMTP or service)
        // Example: sendEmail(email, message.text)
      }
<<<<<<< HEAD
=======
    if (channel === 'email' && alert.email) {
      // Implement email sending logic here (SMTP or service)
>>>>>>> 959f9d6 (feat(alerts): validate Slack alert notification workflow and update testNotifier for production use)
=======
>>>>>>> a2160cb (chore(security): remove personal and global secrets, refactor alert notification for multi-user production support)
    }
  }
}
