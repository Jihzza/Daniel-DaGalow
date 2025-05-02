// functions/send-welcome-email.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail'); // Alternatively, you can use SendGrid

exports.handler = async function(event, context) {
  try {
    // Parse request body
    const { email, name, password } = JSON.parse(event.body);
    
    if (!email || !name || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }
    
    // Replace placeholders in the HTML template
    const currentYear = new Date().getFullYear();
    const emailHtml = yourEmailTemplateHtml
      .replace(/{{name}}/g, name)
      .replace(/{{email}}/g, email)
      .replace(/{{password}}/g, password)
      .replace(/{{currentYear}}/g, currentYear);
    
    // Configure email transport (example with nodemailer and SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: '"Your Company" <noreply@yourcompany.com>',
      to: email,
      subject: 'Welcome to Your Company - Your Account Details',
      html: emailHtml,
      text: `Hello ${name}, Welcome to Your Company! Your account has been created. Email: ${email}, Temporary Password: ${password}. Please change your password after your first login.`
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Welcome email sent successfully' })
    };
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending welcome email', error: error.message })
    };
  }
};

// Your HTML template as a string
const yourEmailTemplateHtml = `
<!DOCTYPE html>
<html>
<!-- Copy the full HTML template from above here -->
</html>
`;