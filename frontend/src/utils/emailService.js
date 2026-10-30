import emailjs from '@emailjs/browser';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// EmailJS Configuration
// Service ID pre-configured from your Gmail connection: service_dl9lt8m
export const EMAILJS_CONFIG = {
  serviceId: env.VITE_EMAILJS_SERVICE_ID || 'service_dl9lt8m',
  templateId: env.VITE_EMAILJS_TEMPLATE_ID || 'template_85q9wsn',
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY || 'gHbdcmb4NBh60Hg4n',
};

/**
 * Sends inquiry or consultation request directly via EmailJS to gmarksoftware@gmail.com
 * Maps form values to exact EmailJS template variables:
 * - name: {{name}}
 * - email: {{email}}
 * - title: {{title}}
 * - time: {{time}}
 * - message: {{message}}
 *
 * @param {Object} params - Form data fields
 * @returns {Promise<{success: boolean, error?: any, status?: number, result?: any}>}
 */
export async function sendContactEmail(params) {
  try {
    // 1. Validation
    const name = (params.name || '').trim();
    const email = (params.email || params.workEmail || '').trim();
    const title = (params.title || params.subject || params.solutionArea || 'Website Inquiry').trim();
    const message = (params.message || '').trim();

    if (!name) {
      return { success: false, error: 'Please enter your name.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!message) {
      return { success: false, error: 'Please enter a message.' };
    }

    // 2. Submission timestamp
    const time = params.time || new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // 3. Exact EmailJS template parameter mapping matching:
    // {{name}}, {{email}}, {{title}}, {{time}}, {{message}}
    const templateParams = {
      name,
      email,
      title,
      time,
      message,

      // Additional standard parameter aliases for template compatibility
      from_name: name,
      user_name: name,
      user_email: email,
      reply_to: email,
      subject: title,
      phone: (params.phone || 'N/A').trim(),
      company: (params.company || 'N/A').trim(),
      solution_area: params.solutionArea || 'N/A',
      category: params.category || params.activeTab || 'Contact Form',
      date: time,
      recipient: 'gmarksoftware@gmail.com'
    };

    // 4. Send via EmailJS SDK
    if (EMAILJS_CONFIG.publicKey) {
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      if (result.status === 200 || result.text === 'OK') {
        return { success: true, result };
      }
      return { success: false, error: result.text || 'Email sending failed' };
    }

    // Direct REST API fallback
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: templateParams
      })
    });

    if (res.ok) {
      return { success: true };
    } else {
      const errorText = await res.text();
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('EmailJS submission error:', error);
    const errorMsg = error?.text || error?.message || 'Failed to send message. Please try again.';
    return { success: false, error: errorMsg };
  }
}
