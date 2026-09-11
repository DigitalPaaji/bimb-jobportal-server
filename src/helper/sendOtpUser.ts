import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "EMAIL_USER and EMAIL_PASS must be configured in environment variables"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Verify SMTP configuration
 * Call this once when your server starts if required.
 */
export const verifyEmailTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("✅ Email transporter is ready");
    return true;
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
    return false;
  }
};

/**
 * Send signup verification OTP
 */
export const sendOtpUser = async (
  email: string,
  otp: string
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> => {
  try {
    if (!email || !otp) {
      return {
        success: false,
        error: "Email and OTP are required",
      };
    }

    const mailOptions = {
      from: `"BIMB" <${EMAIL_USER}>`,
      to: email,
      replyTo: EMAIL_USER,
      subject: "Verify your BIMB account",

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>BIMB Verification Code</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #f5f7fb;
              font-family: Arial, Helvetica, sans-serif;
            "
          >
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="padding: 40px 15px;"
            >
              <tr>
                <td align="center">

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                      max-width: 550px;
                      background-color: #ffffff;
                      border-radius: 12px;
                      overflow: hidden;
                      border: 1px solid #e5e7eb;
                    "
                  >

                    <!-- Header -->
                    <tr>
                      <td
                        align="center"
                        style="
                          padding: 28px 20px;
                          background-color: #153497;
                        "
                      >
                        <h1
                          style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 28px;
                            font-weight: 700;
                          "
                        >
                          BIMB
                        </h1>

                        <p
                          style="
                            margin: 8px 0 0;
                            color: #dbe4ff;
                            font-size: 14px;
                          "
                        >
                          Account Verification
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 35px 30px;">

                        <h2
                          style="
                            margin: 0 0 15px;
                            color: #111827;
                            font-size: 22px;
                          "
                        >
                          Verify your email address
                        </h2>

                        <p
                          style="
                            margin: 0 0 18px;
                            color: #4b5563;
                            font-size: 15px;
                            line-height: 1.6;
                          "
                        >
                          Thank you for signing up for BIMB. Please use the
                          verification code below to complete your registration.
                        </p>

                        <!-- OTP -->
                        <div
                          style="
                            margin: 25px 0;
                            padding: 20px;
                            background-color: #f3f6ff;
                            border: 1px solid #dbe4ff;
                            border-radius: 10px;
                            text-align: center;
                          "
                        >
                          <div
                            style="
                              color: #6b7280;
                              font-size: 12px;
                              margin-bottom: 8px;
                              text-transform: uppercase;
                              letter-spacing: 1px;
                            "
                          >
                            Verification Code
                          </div>

                          <div
                            style="
                              color: #153497;
                              font-size: 32px;
                              font-weight: 700;
                              letter-spacing: 8px;
                            "
                          >
                            ${otp}
                          </div>
                        </div>

                        <p
                          style="
                            margin: 0 0 10px;
                            color: #4b5563;
                            font-size: 14px;
                            line-height: 1.6;
                          "
                        >
                          This code is valid for
                          <strong>5 minutes</strong>.
                        </p>

                        <p
                          style="
                            margin: 0;
                            color: #6b7280;
                            font-size: 13px;
                            line-height: 1.6;
                          "
                        >
                          If you did not create a BIMB account, you can safely
                          ignore this email.
                        </p>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td
                        align="center"
                        style="
                          padding: 20px;
                          background-color: #f9fafb;
                          border-top: 1px solid #eeeeee;
                        "
                      >
                        <p
                          style="
                            margin: 0;
                            color: #9ca3af;
                            font-size: 12px;
                          "
                        >
                          © ${new Date().getFullYear()} BIMB. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Signup OTP sent to ${email}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("❌ Error sending signup OTP:", error);

    return {
      success: false,
      error: "Unable to send verification email",
    };
  }
};

