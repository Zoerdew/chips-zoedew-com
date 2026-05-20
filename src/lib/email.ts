import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.resendApiKey);

export async function sendMagicLinkEmail(input: {
  to: string;
  firstName: string;
  magicUrl: string;
}): Promise<void> {
  const { to, firstName, magicUrl } = input;

  // Plain, Northern, no coach-speak. Matches the brand voice.
  const text = [
    `Hi ${firstName},`,
    "",
    "Here's your link into the 100 Minute Bet portal. Click it and you're in. No password.",
    "",
    magicUrl,
    "",
    "The link works for 30 minutes. If it expires, request a new one from the portal login page.",
    "",
    "Zoe",
    "Falling Forwards Ltd",
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; font-size: 16px; line-height: 1.5; color: #0a0608;">
      <p>Hi ${firstName},</p>
      <p>Here's your link into the 100 Minute Bet portal. Click it and you're in. No password.</p>
      <p>
        <a href="${magicUrl}"
           style="display: inline-block; background: #FF0000; color: #ffffff; font-weight: 800;
                  text-transform: uppercase; letter-spacing: 0.06em; text-decoration: none;
                  padding: 14px 28px; border: 3px solid #0a0608; border-radius: 999px;">
          Open the portal &rarr;
        </a>
      </p>
      <p style="font-size: 14px; color: #555;">
        The link works for 30 minutes. If it expires, request a new one from the portal login page.
      </p>
      <p>Zoe<br>Falling Forwards Ltd</p>
    </div>
  `;

  await resend.emails.send({
    from: `${env.resendFromName} <${env.resendFromEmail}>`,
    replyTo: env.resendReplyTo,
    to,
    subject: "Your way into the 100 Minute Bet portal",
    text,
    html,
  });
}
