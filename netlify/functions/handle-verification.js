// functions/handle-verification.js
exports.handler = async function(event, context) {
    try {
      // Parse the verification data
      const { email } = JSON.parse(event.body);
      
      // Import your Supabase client
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY // Use service key to access database
      );
      
      // Get the user's info and temp password
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('email', email)
        .single();
        
      if (userError) throw userError;
      
      const { data: credData, error: credError } = await supabase
        .from('temp_credentials')
        .select('temp_password')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (credError) throw credError;
      
      // Now send the welcome email with password
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      
      // Send the professional welcome email with password
      await transporter.sendMail({
        from: '"Your Company" <noreply@yourcompany.com>',
        to: email,
        subject: 'Welcome to Your Company - Your Account Details',
        html: generateWelcomeEmail(userData.full_name, email, credData.temp_password),
        text: `Hello ${userData.full_name}, Welcome to Your Company! Your account has been created. Email: ${email}, Password: ${credData.temp_password}. Please change your password after your first login.`
      });
      
      // Optional: Delete the temporary credentials for security
      await supabase
        .from('temp_credentials')
        .delete()
        .eq('email', email);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Welcome email sent successfully' })
      };
      
    } catch (error) {
      console.error('Error handling verification:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error sending welcome email', error: error.message })
      };
    }
  };
  
  // Generate professional HTML email
  function generateWelcomeEmail(name, email, password) {
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Platform</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h1 {
          color: #1e3a8a; /* oxfordBlue color from your theme */
          margin-bottom: 20px;
        }
        .credentials {
          background-color: #fff;
          border: 1px solid #e1e1e1;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .credentials p {
          margin: 10px 0;
        }
        .password {
          font-family: monospace;
          background-color: #f0f0f0;
          padding: 8px 12px;
          border-radius: 4px;
          letter-spacing: 1px;
        }
        .cta-button {
          display: inline-block;
          background-color: #d4af37; /* darkGold color from your theme */
          color: #000;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e1e1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://your-website.com/logo.png" alt="Your Logo" class="logo">
          <h1>Welcome to [Your Company Name]!</h1>
        </div>
        
        <p>Hello ${name},</p>
        
        <p>Thank you for verifying your email address! Your account is now active and ready to use.</p>
        
        <div class="credentials">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <span class="password">${password}</span></p>
        </div>
        
        <p>For security reasons, we recommend changing your password after your first login.</p>
        
        <p style="text-align: center;">
          <a href="https://your-website.com/login" class="cta-button">Login to Your Account</a>
        </p>
        
        <p>If you have any questions or need assistance, feel free to reply to this email or contact our support team.</p>
        
        <p>Best regards,<br>The [Your Company Name] Team</p>
        
        <div class="footer">
          <p>This email was sent to ${email}. If you did not request this account, please contact us immediately.</p>
          <p>&copy; ${new Date().getFullYear()} [Your Company Name]. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;
  }