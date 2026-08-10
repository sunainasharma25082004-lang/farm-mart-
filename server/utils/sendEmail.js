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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Mail sent to Admin
    const adminMailOptions = {
      from: emailUser,
      to: emailReceiver,
      replyTo: (userEmail && userEmail.includes('@') && !userEmail.includes('N/A')) ? userEmail : emailUser,
      subject,
      text
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('📧 Admin Notification Error:', error.message);
      } else {
        console.log('📧 Admin Notification Sent:', info.response);
      }
    });

    // Send Confirmation Email to the User if they provided an email address
    if (userEmail && userEmail.includes('@') && !userEmail.includes('N/A')) {
      const userMailOptions = {
        from: emailUser,
        to: userEmail,
        subject: 'Farmart - We have received your inquiry!',
        text: `Hello,\n\nThank you for reaching out to Farmart. We have received your inquiry details and our regional team will contact you within 24 hours.\n\nBest Regards,\nFarmart Team`
      };

      transporter.sendMail(userMailOptions, (err, info) => {
        if (err) {
          console.error('📧 User Confirmation Email Error:', err.message);
        } else {
          console.log('📧 User Confirmation Email Sent to:', userEmail);
        }
      });
    }

  } catch (err) {
    console.error('📧 Failed to initialize nodemailer:', err.message);
  }
};

export default sendAdminEmail;
