import sgMail from '@sendgrid/mail';
import { config } from '../config/index.js';

if (config.sendgridApiKey) {
  sgMail.setApiKey(config.sendgridApiKey);
}

const FROM_EMAIL = config.fromEmail || 'noreply@onyxreport.com';

class EmailService {
  private enabled: boolean;

  constructor() {
    this.enabled = !!config.sendgridApiKey;
    if (!this.enabled) {
      console.warn('[EmailService] SENDGRID_API_KEY not set — emails will be logged to console only');
    }
  }

  async sendInvitation(email: string, inviteUrl: string, orgName?: string): Promise<void> {
    const subject = `You've been invited to ${orgName || 'Onyx Report'}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome to ${orgName || 'Onyx Report'}!</h2>
        <p style="color: #475569;">You've been invited to join the facility assessment platform.</p>
        <p style="color: #475569;">Click the button below to set up your account:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: #1e293b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
        </p>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't expect this email, you can safely ignore it.</p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.enabled) {
      console.log(`[EmailService] To: ${to}`);
      console.log(`[EmailService] Subject: ${subject}`);
      console.log(`[EmailService] HTML: ${html}`);
      return;
    }

    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
