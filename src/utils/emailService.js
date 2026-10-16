import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Service ID pre-configured from your Gmail connection: service_dl9lt8m
export const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_dl9lt8m',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_contact',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};

/**
 * Sends inquiry or consultation request directly via EmailJS to gmarksoftware@gmail.com
 * @param {Object} params - Form data fields
 * @returns {Promise<{success: boolean, error?: any, status?: number}>}
 */
export async function sendContactEmail(params) {
  try {
    const templateParams = {
      from_name: params.name || 'Website Inquirer',
      user_name: params.name || '',
      user_email: params.email || params.workEmail || '',
      reply_to: params.email || params.workEmail || '',
      phone: params.phone || 'N/A',
      company: params.company || 'N/A',
      subject: params.subject || params.solutionArea || 'New Inbound Website Lead',
      solution_area: params.solutionArea || 'N/A',
      category: params.category || params.activeTab || 'Contact Form',
      message: params.message || '',
      recipient: 'gmarksoftware@gmail.com',
      date: new Date().toLocaleString()
    };

    // If publicKey is provided, send via SDK
    if (EMAILJS_CONFIG.publicKey) {
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      return { success: true, result };
    }

    // Direct REST API call if publicKey is in config
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
    return { success: false, error };
  }
}
