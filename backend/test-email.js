require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function testEmail() {
  console.log("User:", process.env.EMAIL_USER);
  console.log("Pass length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
  try {
    await sendEmail({
      email: 'oursfit1@gmail.com',
      subject: 'Test Email from OursFit',
      message: 'This is a test email to verify Nodemailer is working.',
      html: '<h1>Test Email</h1><p>Nodemailer is working!</p>'
    });
    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Test email failed:", error);
  }
}

testEmail();
