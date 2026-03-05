import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const MERCHANT_LOGIN_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.mechanico.io";
const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "Mechanico <theveinverse@gmail.com>";

function buildWelcomeEmail({
  firstName,
  email,
  password,
}: {
  firstName: string;
  email: string;
  password: string;
}): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Mechanico</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your Mechanico account is ready — here are your login credentials.&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;
  </div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <!-- Logo mark -->
                      <div style="width:36px;height:36px;background:#6366f1;border-radius:9px;display:inline-block;vertical-align:middle;text-align:center;line-height:36px;">
                        <span style="color:#fff;font-size:18px;font-weight:900;">M</span>
                      </div>
                      <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;letter-spacing:-0.3px;margin-left:10px;">Mechanico</span>
                    </div>
                    <p style="margin:20px 0 0;color:#c7d2fe;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Workshop Management</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">
                Welcome aboard, ${firstName}! 👋
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                Your Mechanico merchant account has been created and is ready to use.
                Here are your login credentials — please keep them safe.
              </p>

              <!-- Credentials card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <!-- Email row -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Email Address</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${email}</p>
                        </td>
                      </tr>
                    </table>
                    <!-- Divider -->
                    <div style="height:1px;background:#e2e8f0;margin-bottom:18px;"></div>
                    <!-- Password row -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Temporary Password</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;font-family:'Courier New',Courier,monospace;letter-spacing:0.5px;">${password}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#713f12;line-height:1.5;">
                      <strong>Security tip:</strong> You'll be prompted to change your password on first login. Please do this immediately to secure your account.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);">
                    <a href="${MERCHANT_LOGIN_URL}"
                      style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                      Log in to Mechanico →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="text-align:center;margin:10px 0 0;font-size:12px;color:#94a3b8;">
                Or copy this link:
                <a href="${MERCHANT_LOGIN_URL}" style="color:#6366f1;text-decoration:none;">${MERCHANT_LOGIN_URL}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 16px 16px;padding:24px 40px;">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;line-height:1.6;">
                This email was sent by Mechanico because an account was created for you. If you did not expect this, please contact your administrator.
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                © ${new Date().getFullYear()} Mechanico · All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function sendWelcomeEmail({
  firstName,
  email,
  password,
}: {
  firstName: string;
  email: string;
  password: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Welcome to Mechanico — Your account is ready",
    html: buildWelcomeEmail({ firstName, email, password }),
  });

  if (error) {
    console.error("[sendWelcomeEmail] Failed:", error);
    return { error: error.message };
  }

  return { success: true };
}
