// const sgMail = require("@sendgrid/mail");

// // Set API Key
// sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// const sendEmail = async (to, subject, text) => {
//     try {
//         const msg = {
//             to,
//             from: process.env.EMAIL_FROM, // Your verified SendGrid sender email
//             subject,
//             text
//         };

//         await sgMail.send(msg);
//         console.log("Email sent successfully to:", to);
//     } catch (error) {
//         console.error("SendGrid Error:", error.response?.body || error.message);
//         throw new Error("Email could not be sent.");
//     }
// };

// module.exports = sendEmail;

const sgMail = require("@sendgrid/mail");

// Set API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
    try {
        const msg = {
            to,
            from: process.env.EMAIL_FROM, // Your verified SendGrid sender email
            subject,
            text
        };

        await sgMail.send(msg);
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("SendGrid Error:", error.response?.body || error.message);
        throw new Error("Email could not be sent.");
    }
};

module.exports = sendEmail;