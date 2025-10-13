import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string,
) {
  if (!resend) {
    throw new Error(
      "Email service is not configured. Please contact support or check your environment variables.",
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "support@idrc.site",
      to: email,
      subject: "Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-wrapper {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #1a1a1a;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
              }
              p {
                color: #666;
                font-size: 16px;
                margin-bottom: 20px;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button {
                display: inline-block;
                padding: 14px 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
              }
              .button:hover {
                opacity: 0.9;
              }
              .link {
                color: #667eea;
                word-break: break-all;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #999;
                font-size: 14px;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="logo">
                  <h2 style="color: #667eea; margin: 0;">🔐 IDRC</h2>
                </div>
                
                <h1>Reset Your Password</h1>
                
                <p>Hi${userName ? ` ${userName}` : ""},</p>
                
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p style="text-align: center; color: #999; font-size: 14px;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="link">${resetUrl}</a>
                </p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong><br>
                  This link will expire in 24 hours. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </div>
                
                <div class="footer">
                  <p>
                    This email was sent from IDRC. If you have any questions, please contact our support team.
                  </p>
                  <p style="margin-top: 10px;">
                    © ${new Date().getFullYear()} IDRC. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendVerificationOTP(
  email: string,
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password",
) {
  if (!resend) {
    throw new Error(
      "Email service is not configured. Please contact support or check your environment variables.",
    );
  }

  const subjects = {
    "sign-in": "Your Sign-In Code",
    "email-verification": "Verify Your Email",
    "forget-password": "Password Reset Code",
  };

  const titles = {
    "sign-in": "Sign In to Your Account",
    "email-verification": "Verify Your Email Address",
    "forget-password": "Reset Your Password",
  };

  const descriptions = {
    "sign-in": "Use the code below to sign in to your account:",
    "email-verification": "Use the code below to verify your email address:",
    "forget-password": "Use the code below to reset your password:",
  };

  try {
    const { data, error } = await resend.emails.send({
      from: "IDRC <support@idrc.site>",
      to: email,
      subject: subjects[type],
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subjects[type]}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-wrapper {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo {
                text-align: center;
                margin-bottom: 30px;
              }
              h1 {
                color: #1a1a1a;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
              }
              p {
                color: #666;
                font-size: 16px;
                margin-bottom: 20px;
              }
              .otp-container {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #667eea;
                font-family: 'Courier New', monospace;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #999;
                font-size: 14px;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="logo">
                  <h2 style="color: #667eea; margin: 0;">🔐 IDRC</h2>
                </div>
                
                <h1>${titles[type]}</h1>
                
                <p>Hi,</p>
                
                <p>${descriptions[type]}</p>
                
                <div class="otp-container">
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p style="text-align: center; color: #999; font-size: 14px;">
                  This code will expire in 10 minutes.
                </p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong><br>
                  Never share this code with anyone. If you didn't request this code, please ignore this email or contact support if you have concerns.
                </div>
                
                <div class="footer">
                  <p>
                    This email was sent from IDRC. If you have any questions, please contact our support team.
                  </p>
                  <p style="margin-top: 10px;">
                    © ${new Date().getFullYear()} IDRC. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      throw new Error(
        `Failed to send verification email: ${error.message || "Unknown error"}`,
      );
    }

    return { success: true, data };
  } catch (error: any) {
    throw new Error(
      error.message || "Failed to send verification email. Please try again.",
    );
  }
}
