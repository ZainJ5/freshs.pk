import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { buildOrderConfirmationEmail } from "./orderConfirmationEmail";

let cachedTransporter = null;

/**
 * Lazily creates (and caches) a Hostinger SMTP transporter.
 * Returns null when credentials are not configured so callers can skip silently.
 *
 * Configure via .env:
 *   SMTP_HOST  (default smtp.hostinger.com)
 *   SMTP_PORT  (default 465)
 *   SMTP_USER  (your Hostinger mailbox, e.g. orders@freshs.pk)
 *   SMTP_PASS  (mailbox password)
 *   SMTP_FROM_NAME (display name, default "Freshs.pk")
 */
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn(
      "[mail] SMTP_USER / SMTP_PASS not set — skipping order confirmation email."
    );
    return null;
  }

  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT) || 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // SSL on 465, STARTTLS on 587
    auth: { user, pass },
  });

  return cachedTransporter;
}

// Resolve the logo once so we can attach it inline (CID) for reliable rendering.
function getLogoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (!fs.existsSync(logoPath)) return null;
  return {
    filename: "logo.png",
    path: logoPath,
    cid: "freshlogo",
  };
}

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/**
 * Sends the order confirmation email. Never throws — returns true on success,
 * false when skipped or on failure, so the order flow is never blocked.
 *
 * @param {object} order - saved order document (branch may be populated)
 */
export async function sendOrderConfirmationEmail(order) {
  try {
    if (!order || !isValidEmail(order.email)) {
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) return false;

    const logo = getLogoAttachment();
    const { subject, html, text } = buildOrderConfirmationEmail(order, {
      logoCid: logo ? logo.cid : null,
    });

    const fromName = process.env.SMTP_FROM_NAME || "Freshs.pk";
    const fromAddress = process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: order.email.trim(),
      subject,
      html,
      text,
      attachments: logo ? [logo] : [],
    });

    console.log(`[mail] Order confirmation sent to ${order.email} (#${order.orderNo})`);
    return true;
  } catch (error) {
    console.error("[mail] Failed to send order confirmation email:", error);
    return false;
  }
}
