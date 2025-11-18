// backend/utils/emailService.js
const nodemailer = require('nodemailer');

/**
 * Email Service Configuration
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }
  
  /**
   * Initialize email transporter
   */
  initialize() {
    if (this.initialized) return;
    
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      this.initialized = true;
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }
  
  /**
   * Send email
   */
  async sendEmail(options) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to MediCare Plus!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MediCare Plus!</h2>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for registering with MediCare Plus. We're excited to have you on board!</p>
        <p>Your account has been successfully created. You can now:</p>
        <ul>
          <li>Book appointments with doctors</li>
          <li>Access your medical records</li>
          <li>Get prescriptions online</li>
          <li>Chat with our AI assistant</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });
  }
  
  /**
   * Send email verification
   */
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    const subject = 'Verify Your Email Address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Hi ${user.firstName},</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });
  }
  
  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; font-size: 14px;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #e74c3c; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });
  }
  
  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointment, patient, doctor) {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const subject = 'Appointment Confirmed';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmed</h2>
        <p>Hi ${patient.user.firstName},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Doctor:</strong> Dr. ${doctor.user.firstName} ${doctor.user.lastName}</p>
          <p><strong>Specialization:</strong> ${doctor.specialization}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Type:</strong> ${appointment.appointmentType}</p>
          <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: patient.user.email,
      subject: subject,
      html: html
    });
  }
  
  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(appointment, patient, doctor) {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const subject = 'Appointment Reminder';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Hi ${patient.user.firstName},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Doctor:</strong> Dr. ${doctor.user.firstName} ${doctor.user.lastName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
        </div>
        <p>Please don't forget to bring any relevant medical documents.</p>
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: patient.user.email,
      subject: subject,
      html: html
    });
  }
  
  /**
   * Send leave approval email to doctor
   */
  async sendLeaveApprovalEmail(leave, doctor) {
    const startDate = new Date(leave.startDate).toLocaleDateString();
    const endDate = new Date(leave.endDate).toLocaleDateString();
    
    const subject = 'Leave Request Approved';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Leave Approved</h2>
        <p>Hi Dr. ${doctor.user.firstName},</p>
        <p>Your leave request has been approved:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leave.leaveType}</p>
          <p><strong>From:</strong> ${startDate}</p>
          <p><strong>To:</strong> ${endDate}</p>
          <p><strong>Total Days:</strong> ${leave.totalDays}</p>
        </div>
        ${leave.approvalComments ? `<p><strong>Comments:</strong> ${leave.approvalComments}</p>` : ''}
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: doctor.user.email,
      subject: subject,
      html: html
    });
  }
  
  /**
   * Send leave rejection email to doctor
   */
  async sendLeaveRejectionEmail(leave, doctor) {
    const subject = 'Leave Request Rejected';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Leave Request Rejected</h2>
        <p>Hi Dr. ${doctor.user.firstName},</p>
        <p>Unfortunately, your leave request has been rejected.</p>
        ${leave.rejectionReason ? `<p><strong>Reason:</strong> ${leave.rejectionReason}</p>` : ''}
        <p>If you have any questions, please contact the administration.</p>
        <p>Best regards,<br>The MediCare Plus Team</p>
      </div>
    `;
    
    return await this.sendEmail({
      to: doctor.user.email,
      subject: subject,
      html: html
    });
  }
}

// Create and export singleton instance
const emailService = new EmailService();

module.exports = emailService;