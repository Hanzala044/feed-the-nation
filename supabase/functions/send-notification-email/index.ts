const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  to: string;
  subject: string;
  donationTitle: string;
  message: string;
  actionUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, donationTitle, message, actionUrl }: NotificationRequest = await req.json();

    console.log("Sending notification email to:", to);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Foodie Notifications <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .container {
                background: linear-gradient(135deg, #FFF8E7 0%, #FFE8D6 100%);
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .logo {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo-text {
                font-size: 32px;
                font-weight: bold;
                color: #FF6B35;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #FF6B35;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .donation-title {
                background: white;
                padding: 15px 20px;
                border-radius: 16px;
                border-left: 4px solid #FF6B35;
                margin: 20px 0;
                font-weight: 600;
              }
              .message {
                background: white;
                padding: 20px;
                border-radius: 16px;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                background: #FF6B35;
                color: white !important;
                padding: 14px 32px;
                border-radius: 16px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
              }
              .button:hover {
                background: #FF5722;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid rgba(255, 107, 53, 0.2);
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <div class="logo-text">🍽️ Foodie</div>
              </div>
              <h1>${subject}</h1>
              <div class="donation-title">
                📦 ${donationTitle}
              </div>
              <div class="message">
                ${message}
              </div>
              ${actionUrl ? `
                <center>
                  <a href="${actionUrl}" class="button">View Donation Details</a>
                </center>
              ` : ''}
              <div class="footer">
                <p>Thank you for being part of our community! 💚</p>
                <p>Together, we're reducing food waste and feeding those in need.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);
