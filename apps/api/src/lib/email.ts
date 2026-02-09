import sgMail from '@sendgrid/mail';
import { config } from '../config/index.js';

if (config.sendgridApiKey) {
  sgMail.setApiKey(config.sendgridApiKey);
}

const FROM_EMAIL = config.fromEmail || 'noreply@onyxreport.com';
const WEB_URL = config.webUrl;

class EmailService {
  private enabled: boolean;

  constructor() {
    this.enabled = !!config.sendgridApiKey;
    if (!this.enabled) {
      console.warn('[EmailService] SENDGRID_API_KEY not set — emails will be logged to console only');
    }
  }

  async sendInvitation(email: string, inviteToken: string, orgName?: string): Promise<void> {
    const inviteUrl = `${WEB_URL}/accept-invite/${inviteToken}`;
    const subject = `You've been invited to ${orgName || 'Onyx Report'}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome to ${orgName || 'Onyx Report'}!</h2>
        <p style="color: #475569;">You've been invited to join the facility assessment platform.</p>
        <p style="color: #475569;">Click the button below to set up your account:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background-color: #1e293b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Accept Invitation</a>
        </p>
        <p style="color: #94a3b8; font-size: 14px;">This link expires in 7 days.</p>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't expect this email, you can safely ignore it.</p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${WEB_URL}/reset-password/${resetToken}`;
    const subject = 'Reset your Onyx Report password';
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Password Reset Request</h2>
        <p style="color: #475569;">We received a request to reset your password.</p>
        <p style="color: #475569;">Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #1e293b; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </p>
        <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
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
