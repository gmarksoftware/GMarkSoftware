import { resend } from '../config/resend.js';

export const sendContactEmail = async ({ name, email, phone, subject, message }) => {
  const emailSubject = `G Mark Contact Form: ${subject || 'New Message'}`;
  const emailBody = `
    <h2>New Contact Message Received</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
    <p><strong>Subject:</strong> ${subject || 'Technical Support'}</p>
    <br/>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap; background: #f4f4f4; padding: 12px; border-radius: 6px;">${message}</p>
  `;

  if (resend) {
    try {
      const recipientEmail = process.env.CONTACT_RECEIVER_EMAIL || 'gmarksoftware@gmail.com';
      const senderEmail = process.env.CONTACT_SENDER_EMAIL || 'G Mark Admin <onboarding@resend.dev>';
      const emailResponse = await resend.emails.send({
        from: senderEmail,
        to: recipientEmail,
        subject: emailSubject,
        html: emailBody
      });
      console.log(`[Email] Alert sent via Resend API key to ${recipientEmail} from ${senderEmail}:`, emailResponse.data?.id || 'Success');
      return emailResponse;
    } catch (emailError) {
      console.error('[Email Error] Failed to send email alert via Resend:', emailError);
      throw emailError;
    }
  } else {
    console.log('=====================================================');
    console.log('[Email Alert Fallback - No RESEND_API_KEY configured]');
    console.log(`To: gmarksoftware@gmail.com`);
    console.log(`Subject: ${emailSubject}`);
    console.log('Content:');
    console.log(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\nMessage: ${message}`);
    console.log('=====================================================');
    return { fallback: true };
  }
};
