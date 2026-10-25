import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { clientName, clientEmail, inviteUrl } = await request.json();

    // Basic validation
    if (!clientName || !clientEmail || !inviteUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check API key exists at runtime (not just at import)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: 'Aether OS <onboarding@resend.dev>',
      to: clientEmail,
      subject: `${clientName}, you've been invited to the Aether OS Client Portal`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="margin:0;padding:0;background:#faf9f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:560px;margin:40px auto;padding:40px 32px;background:#ffffff;border-radius:16px;border:1px solid #e2e0dc;">
              <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;padding:8px 16px;background:#030612;color:#ffffff;border-radius:8px;font-weight:700;letter-spacing:0.08em;font-size:14px;">
                  AETHER OS
                </div>
              </div>

              <h1 style="font-size:24px;font-weight:700;color:#1a1c1e;margin:0 0 16px;line-height:1.3;">
                Welcome, ${clientName}
              </h1>

              <p style="font-size:15px;line-height:1.6;color:#5a5c64;margin:0 0 24px;">
                You've been invited to access your dedicated client portal on Aether OS.
                Through the portal you can view project deliverables, review contracts,
                and settle invoices in one secure place.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background:#030612;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
                  Set Up Your Portal Access
                </a>
              </div>

              <p style="font-size:13px;line-height:1.6;color:#82848c;margin:24px 0 0;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size:12px;color:#5a5c64;word-break:break-all;background:#f5f4f2;padding:12px;border-radius:6px;margin:8px 0 0;font-family:monospace;">
                ${inviteUrl}
              </p>

              <hr style="border:none;border-top:1px solid #e2e0dc;margin:32px 0 24px;">

              <p style="font-size:12px;color:#82848c;margin:0;text-align:center;">
                This invitation was sent to ${clientEmail}. If you didn't expect this,
                you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (err: any) {
    console.error('Invite send error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
