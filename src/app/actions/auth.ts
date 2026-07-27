'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function changePassword(data: { userId: number, currentPassword: string, newPassword: string }) {
  try {
    const { userId, currentPassword, newPassword } = data;

    if (!userId || !currentPassword || !newPassword) {
      return { success: false, error: 'All fields are required.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: 'Incorrect current password.' };
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'Password updated successfully!' };
  } catch (error: any) {
    console.error('Change password error:', error);
    return { success: false, error: 'Internal server error. Please try again later.' };
  }
}

export async function forgotPassword(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { success: true };
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: token,
        reset_token_expiry: expiry
      }
    });

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #1e3a8a;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 16px;">We received a request to reset your password for your Papikost account.</p>
        <p style="color: #475569; font-size: 16px;">Click the button below to set a new password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 15px; margin-bottom: 15px;">Reset Password</a>
        <p style="color: #475569; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">Best regards,<br>Papikost Management</p>
      </div>
    `;

    await sendEmail(email, 'Papikost Password Reset Request', emailHtml);

    return { success: true };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return { success: false, error: 'Failed to process request.' };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: { gt: new Date() }
      }
    });

    if (!user) {
      return { success: false, error: 'Invalid or expired password reset token.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Failed to reset password.' };
  }
}
