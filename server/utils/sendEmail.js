import nodemailer from 'nodemailer';

const sendAdminEmail = async (subject, text, userEmail = null) => {
  try {
    // Hardcode fallback credentials so emails ALWAYS go to officialfarmmart@gmail.com even if Render env is not set!
    const emailUser = process.env.EMAIL_USER || 'officialfarmmart@gmail.com';
    const rawPass = process.env.EMAIL_PASS || 'nuxwsctczzomzgzq';
    const emailPass = rawPass.replace(/\s+/g, '');
    const emailReceiver = 'officialfarmmart@gmail.com'; // Guaranteed delivery to client email!

    console.log(`📧 Dispatching Admin Email via ${emailUser} to ${emailReceiver}...`);

    // High-reliability Gmail SMTP transport using Port 465 SSL/TLS
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Mail sent directly to Client's official email
    const adminMailOptions = {
      from: `"Farmart Agri-Tech" <${emailUser}>`,
      to: emailReceiver,
      replyTo: (userEmail && userEmail.includes('@') && !userEmail.includes('N/A')) ? userEmail : emailUser,
      subject,
      text
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('❌ Admin Email Dispatch Error:', error.message);
      } else {
        console.log('✅ Admin Email Dispatched Successfully to officialfarmmart@gmail.com:', info.response);
      }
    });

    // Send Auto-Confirmation Email to the candidate if they submitted a valid email
    if (userEmail && userEmail.includes('@') && !userEmail.includes('N/A') && userEmail.toLowerCase() !== emailReceiver.toLowerCase()) {
      const userMailOptions = {
        from: `"Farmart Team" <${emailUser}>`,
        to: userEmail,
        subject: 'Farmart - We have received your inquiry!',
        text: `Hello,\n\nThank you for reaching out to Farmart. We have received your inquiry details and our regional team will contact you within 24 hours.\n\nBest Regards,\nFarmart Team`
      };

      transporter.sendMail(userMailOptions, (err, info) => {
        if (err) {
          console.error('❌ User Confirmation Email Dispatch Error:', err.message);
        } else {
          console.log('✅ User Confirmation Email Dispatched to:', userEmail);
        }
      });
    }

  } catch (err) {
    console.error('❌ Failed to initialize nodemailer:', err.message);
  }
};

export default sendAdminEmail;
