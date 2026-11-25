import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export interface SendMailOptions {
  subject: string;
  body: string;
  resourceLink?: string | null;
  resourceTitle?: string | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
  recipients: string[];
}

export interface SendMailResult {
  total: number;
  sent: number;
  failed: number;
  successfulEmails: string[];
  failedEmails: { email: string; error: string }[];
  previewUrl?: string | null;
  configured: boolean;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private verified = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    // Non-blocking: verify connection in background so SMTP timeouts or slow network NEVER block NestJS startup or HTTP traffic
    this.verifyConnection().catch((err) => {
      this.logger.warn(`[Email] Background SMTP verification failed: ${this.sanitizeErrorMessage(err?.message)}`);
    });
  }

  /** Helper to sanitize error messages so credentials or tokens are never exposed in logs */
  private sanitizeErrorMessage(msg: string): string {
    if (!msg) return 'Unknown error';
    const pass = this.getSmtpPass();
    let sanitized = msg;
    if (pass && pass.length > 2) {
      sanitized = sanitized.split(pass).join('***');
    }
    // Remove any user:pass@ format in URLs
    sanitized = sanitized.replace(/(https?:\/\/|smtp:\/\/)[^:]+:[^@]+@/gi, '$1***:***@');
    return sanitized;
  }

  private getSmtpPass(): string {
    return (
      this.config.get<string>('SMTP_PASS', '') ||
      this.config.get<string>('SMTP_PASSWORD', '') ||
      ''
    ).trim();
  }

  /** Check whether real SMTP credentials are configured in environment */
  isConfigured(): boolean {
    const user = this.config.get<string>('SMTP_USER', '').trim();
    const pass = this.getSmtpPass();
    return Boolean(user && pass);
  }

  /** Verify SMTP connection safely at startup or on demand */
  async verifyConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      this.logger.warn(
        '[Email] SMTP configuration is missing. Live email delivery is disabled. Please configure SMTP_USER and SMTP_PASS in environment variables.',
      );
      this.verified = false;
      return {
        success: false,
        message: 'SMTP configuration is missing. Please configure SMTP_USER and SMTP_PASS.',
      };
    }

    const host = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com').trim() || 'smtp.gmail.com';
    const port = Number(this.config.get<string>('SMTP_PORT', '587')) || 587;
    const user = this.config.get<string>('SMTP_USER', '').trim();
    const maskedUser = user ? user.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '***';

    try {
      this.logger.log(`[Email] SMTP configuration detected (Host: ${host}, Port: ${port}, User: ${maskedUser})`);
      this.logger.log('[Email] Connecting to SMTP...');

      const transporter = await this.getTransporter();
      // Cap verify timeout at 5000ms so an unreachable SMTP server never hangs
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP connection timed out after 5000ms')), 5000),
      );
      await Promise.race([verifyPromise, timeoutPromise]);

      this.verified = true;
      this.logger.log(`[Email] SMTP connection verified successfully`);
      return { success: true, message: 'SMTP connection verified successfully' };
    } catch (err: any) {
      this.verified = false;
      const safeMsg = this.sanitizeErrorMessage(err.message || 'SMTP connection failed');
      this.logger.error(`[Email] SMTP connection failed: ${safeMsg}`);
      return { success: false, message: safeMsg };
    }
  }

  getSmtpStatus() {
    const configured = this.isConfigured();
    const host = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = Number(this.config.get<string>('SMTP_PORT', '587')) || 587;
    const secure = this.config.get<string>('SMTP_SECURE', 'false') === 'true' || port === 465;
    const user = this.config.get<string>('SMTP_USER', '');
    const from = this.config.get<string>('SMTP_FROM', user || 'newsletter@gramguru.org');

    return {
      configured,
      verified: this.verified,
      host,
      port,
      secure,
      from,
      user: user ? user.replace(/(.{3})(.*)(@.*)/, '$1***$3') : 'Not configured',
    };
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const user = this.config.get<string>('SMTP_USER', '').trim();
    const pass = this.getSmtpPass();
    const host = this.config.get<string>('SMTP_HOST', '').trim() || 'smtp.gmail.com';
    const port = Number(this.config.get<string>('SMTP_PORT', '587')) || 587;
    const secure = this.config.get<string>('SMTP_SECURE', 'false') === 'true' || port === 465;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false,
        },
      });
      return this.transporter;
    }

    // In production, never silently pretend or use fake fallbacks
    throw new Error('SMTP configuration is missing. Live emails cannot be dispatched.');
  }

  /** Build branded HTML email body */
  private generateHtml(subject: string, body: string, resourceLink?: string | null, resourceTitle?: string | null): string {
    const formattedBody = (body || '')
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #2d3748;">${p}</p>`)
      .join('');

    let finalLink = (resourceLink || '').trim();
    if (finalLink.startsWith('/uploads/')) {
      const serverBase = this.config.get<string>('SERVER_URL') ||
        (this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001');
      finalLink = `${serverBase.replace(/\/$/, '')}${finalLink}`;
    }

    const validUrl = finalLink.startsWith('http://') || finalLink.startsWith('https://');

    const resourceHtml = validUrl
      ? `
      <div style="margin: 28px 0; padding: 20px; background-color: #f0f7ed; border: 1px solid #c2e0b8; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #1b4332;">
          📎 ${resourceTitle ? `Resource Attached: ${resourceTitle}` : 'Attached Resource Available'}
        </p>
        <a href="${finalLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 28px; background-color: #1b4332; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          Open & View Resource →
        </a>
      </div>
      `
      : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 30px 15px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #1b4332; padding: 28px 30px; text-align: left;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td>
                        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                          Gram Guru Foundation
                        </h1>
                        <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #b7e4c7; text-transform: uppercase; letter-spacing: 1px;">
                          Empowering Rural India · Community Update
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Email Content -->
              <tr>
                <td style="padding: 32px 30px;">
                  <h2 style="margin: 0 0 18px 0; font-size: 20px; font-weight: 700; color: #1b4332;">
                    ${subject}
                  </h2>
                  <div style="font-size: 15px; color: #2d3748;">
                    ${formattedBody}
                  </div>
                  ${resourceHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #fafbfc; padding: 24px 30px; border-top: 1px solid #edf2f7; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; color: #718096;">
                    You are receiving this real-time email because you are a registered subscriber to updates from <strong>GramGuru Foundation</strong>.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #a0aec0;">
                    © ${new Date().getFullYear()} Gram Guru Foundation · All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  /** Send a welcome email to a newly registered user */
  async sendWelcomeEmail(recipientEmail: string, fullName: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(`[Email] Skipping welcome email for ${recipientEmail}: SMTP configuration is missing.`);
      return;
    }

    const firstName = fullName?.split(' ')[0] || fullName || 'there';
    const subject = `Welcome to Gram Guru Foundation, ${firstName}! 🎉`;
    const body = `Hi ${firstName},\n\nThank you for registering with Gram Guru Foundation! We're thrilled to have you as part of our community.\n\nAt GramGuru, we're committed to empowering rural India through education and digital literacy. Your journey with us starts now!\n\nHere's what you can do:\n• Explore our courses and learning resources\n• Track your progress on your personal dashboard\n• Connect with our growing community\n\nIf you ever need help, feel free to reach out to us.\n\nWarm regards,\nThe Gram Guru Foundation Team`;

    try {
      await this.sendToSubscribers({
        subject,
        body,
        recipients: [recipientEmail],
      });
      this.logger.log(`✓ Welcome email dispatched to new user: ${recipientEmail}`);
    } catch (err: any) {
      this.logger.error(`✗ Failed to send welcome email to ${recipientEmail}: ${this.sanitizeErrorMessage(err.message)}`);
    }
  }

  /** Send newsletter or message to real-time subscribers */
  async sendToSubscribers(opts: SendMailOptions): Promise<SendMailResult> {
    if (!this.isConfigured()) {
      this.logger.error('[Email] SMTP configuration is missing. Cannot send email.');
      throw new Error('SMTP configuration is missing on the server. Please set SMTP_USER and SMTP_PASS in environment variables.');
    }

    const { subject, body, resourceLink, resourceTitle, recipients } = opts;
    const cleanRecipients = Array.from(
      new Set(
        recipients
          .map((r) => r.trim().toLowerCase())
          .filter((r) => r.includes('@')),
      ),
    );

    const result: SendMailResult = {
      total: cleanRecipients.length,
      sent: 0,
      failed: 0,
      successfulEmails: [],
      failedEmails: [],
      previewUrl: null,
      configured: true,
    };

    if (cleanRecipients.length === 0) {
      this.logger.warn('[Email] No valid recipient emails supplied for newsletter.');
      return result;
    }

    const transporter = await this.getTransporter();
    const fromAddress =
      this.config.get<string>('SMTP_FROM') ||
      `"GramGuru Foundation" <${this.config.get<string>('SMTP_USER')}>`;

    const htmlContent = this.generateHtml(subject, body, resourceLink, resourceTitle);
    const plainText = `${subject}\n\n${body}\n\n${resourceLink ? `Resource: ${resourceTitle || resourceLink} (${resourceLink})` : ''}\n\n---\nGram Guru Foundation`;

    const attachments: nodemailer.Attachment[] = [];

    // 1. Explicit attachment path (handles external URLs, /uploads/ relative, and absolute paths)
    if (opts.attachmentPath) {
      const aPath = opts.attachmentPath.trim();
      if (aPath.startsWith('http://') || aPath.startsWith('https://')) {
        try {
          const urlObj = new URL(aPath);
          const parsedName = path.basename(urlObj.pathname) || 'attachment';
          attachments.push({
            filename: opts.attachmentName || parsedName,
            path: aPath,
          });
        } catch {
          attachments.push({
            filename: opts.attachmentName || 'attachment',
            path: aPath,
          });
        }
      } else if (aPath.startsWith('/uploads/')) {
        const localPath = path.join(UPLOAD_DIR, aPath.replace(/^\/uploads\//, ''));
        if (fs.existsSync(localPath)) {
          attachments.push({
            filename: opts.attachmentName || path.basename(localPath),
            path: localPath,
          });
        }
      } else if (fs.existsSync(aPath)) {
        attachments.push({
          filename: opts.attachmentName || path.basename(aPath),
          path: aPath,
        });
      }
    }

    // 2. Resource link pointing to uploaded file on server
    if (opts.resourceLink) {
      const link = opts.resourceLink.trim();
      if (link.startsWith('/uploads/')) {
        const localPath = path.join(UPLOAD_DIR, link.replace(/^\/uploads\//, ''));
        if (fs.existsSync(localPath)) {
          attachments.push({
            filename: opts.resourceTitle || path.basename(localPath),
            path: localPath,
          });
        }
      } else if (link.startsWith('http://') || link.startsWith('https://')) {
        try {
          const urlObj = new URL(link);
          const parsedName = path.basename(urlObj.pathname) || 'attachment';
          attachments.push({
            filename: opts.resourceTitle || parsedName,
            path: link,
          });
        } catch {
          attachments.push({
            filename: opts.resourceTitle || 'attachment',
            path: link,
          });
        }
      } else if (fs.existsSync(link)) {
        attachments.push({
          filename: opts.resourceTitle || path.basename(link),
          path: link,
        });
      }
    }

    this.logger.log(`[Email] Starting dispatch to ${cleanRecipients.length} subscriber(s)...`);

    for (let i = 0; i < cleanRecipients.length; i++) {
      const recipient = cleanRecipients[i];
      if (i > 0) {
        // Throttled pause between dispatches to avoid SMTP/Gmail rate limits
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      try {
        this.logger.log(`[Email] Sending email to subscriber: ${recipient}`);
        const info = await transporter.sendMail({
          from: fromAddress,
          to: recipient,
          subject,
          text: plainText,
          html: htmlContent,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        result.sent++;
        result.successfulEmails.push(recipient);
        this.logger.log(`[Email] Email sent successfully to ${recipient} (MessageId: ${info.messageId || 'ok'})`);
      } catch (err: any) {
        result.failed++;
        const safeError = this.sanitizeErrorMessage(err.message || 'Send error');
        result.failedEmails.push({ email: recipient, error: safeError });
        this.logger.error(`[Email] ✗ Failed to send email to ${recipient}: ${safeError}`);
      }
    }

    this.logger.log(
      `[Email] Newsletter dispatch completed: ${result.sent} sent, ${result.failed} failed out of ${result.total}.`,
    );

    return result;
  }
}
