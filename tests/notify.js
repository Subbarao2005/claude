const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

const webhook = process.env.SLACK_WEBHOOK_URL;
const failures = process.argv.slice(2).join(' ') || 'Unknown failures';

if (!webhook) {
  console.log('SLACK_WEBHOOK_URL not configured; skipping notification.');
  process.exit(0);
}

axios.post(webhook, {
  text: 'Melcho deploy test FAILED',
  blocks: [
    { type: 'section', text: { type: 'mrkdwn', text: '*Melcho deploy test FAILED*' } },
    { type: 'section', text: { type: 'mrkdwn', text: `*Failed:* ${failures}` } },
    { type: 'section', text: { type: 'mrkdwn', text: `*Time:* ${new Date().toISOString()}` } },
    { type: 'section', text: { type: 'mrkdwn', text: 'Fix: Review GitHub Actions logs for the failing stage.' } }
  ]
}).then(() => {
  console.log('Slack notification sent.');
}).catch(err => {
  console.error('Slack notification failed:', err.message);
});
