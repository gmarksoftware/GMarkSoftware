import { prisma } from '../config/db.js';
import { sendContactEmail } from '../services/emailService.js';
import { contactSchema } from '../validations/contactValidation.js';
import { z } from 'zod';

export const submitContactForm = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = contactSchema.parse(req.body);
    const { name, email, phone, subject, message } = validatedData;

    // Save to database
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'Technical Support',
        message
      }
    });

    console.log(`[Database] Message stored successfully. ID: ${savedMessage.id}`);

    // Send email alert
    try {
      await sendContactEmail({ name, email, phone, subject, message });
    } catch (emailErr) {
      console.error('[Email Warning] Failed to send email alert, but data was stored:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Your message has been received successfully!',
      data: {
        id: savedMessage.id,
        createdAt: savedMessage.createdAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
};
