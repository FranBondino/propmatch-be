import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
export class EmailNotificationService {
  private transporter: Transporter;

  constructor() {
    // Create a transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or any other email service provider
      auth: {
        user: 'franbondino@gmail.com', // replace with your email
        pass: 'lybb khzv qsxl nfhj', // replace with your email password
      },
    });
  }

  // Method to send an email
  public async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: 'franbondino@gmail.com', // sender address
      to, // recipient address
      subject, // Subject line
      text, // plain text body
    };

    await this.transporter.sendMail(mailOptions); // Send email
  }
}
