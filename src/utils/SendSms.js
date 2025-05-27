const twilio = require("twilio");

// Use your credentials here
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

/**
 * Send SMS function
 * @param {string} to - Recipient's phone number in E.164 format (e.g., '+1234567890')
 * @param {string} message - Message content
 */
function sendSms(message) {
  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: process.env.MY_PHONE_NUMBER, // Recipient's phone number,
    })
    .then((message) => {
      console.log(`Message sent successfully. SID: ${message.sid}`, message);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

// Example usage:
// sendSms('+919876543210', 'Hello from Twilio! This is a test message.');
module.exports = sendSms;
