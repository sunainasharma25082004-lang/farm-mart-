import nodemailer from 'nodemailer';

const sendAdminEmail = async (subject, text, userEmail = null) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
    const emailReceiver = process.env.EMAIL_RECEIVER || emailUser;

    if (!emailUser || !emailPass) {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASS environment variable missing on Render.');
      return;
    }

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

    // Mail sent to Admin
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
        console.log('✅ Admin Email Dispatched Successfully:', info.response);
      }
    });

    // Send Confirmation Email to the User if provided
    if (userEmail && userEmail.includes('@') && !userEmail.includes('N/A') && userEmail !== emailReceiver) {
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
