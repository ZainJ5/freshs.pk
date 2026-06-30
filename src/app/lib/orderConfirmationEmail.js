// Builds a professional, email-client-friendly HTML order confirmation.
// Uses table-based layout + inline styles for maximum compatibility (Gmail, Outlook, Apple Mail).

const BRAND = {
  green: "#547a2c",
  greenDark: "#3f5e22",
  greenLight: "#689537",
  bg: "#f4f9ed",
  text: "#1f2933",
  muted: "#6b7280",
  border: "#e5e7eb",
};

const COMPANY = {
  name: "Freshs.pk",
  tagline: "Farm-fresh quality, delivered to your door",
  phone: "+92 336 2069023",
  address: "Nazimabad No.5, Karachi",
  website: "https://freshs.pk",
};

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (value) => {
  const num = Number(value) || 0;
  return `PKR ${num.toLocaleString("en-PK")}`;
};

const getNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

function buildItemRows(items = []) {
  return items
    .map((item, index) => {
      const name = esc(item.title || item.name || "Item");
      const quantity = getNumber(item.quantity, 1);
      const price = getNumber(item.price);
      const lineTotal = price * quantity;

      const modifiers = [];
      if (item.selectedVariation?.name) {
        modifiers.push(esc(item.selectedVariation.name));
      } else if (item.type) {
        modifiers.push(esc(item.type));
      }
      if (Array.isArray(item.selectedExtras)) {
        item.selectedExtras.forEach((extra) =>
          modifiers.push(`+ ${esc(extra.name)}`)
        );
      }
      if (Array.isArray(item.selectedSideOrders)) {
        item.selectedSideOrders.forEach((side) =>
          modifiers.push(`+ ${esc(side.name)}`)
        );
      }
      if (item.specialInstructions) {
        modifiers.push(`Note: ${esc(item.specialInstructions)}`);
      }

      const modifiersHtml = modifiers.length
        ? `<div style="margin-top:4px;font-size:12px;color:${BRAND.muted};line-height:1.5;">${modifiers.join("<br/>")}</div>`
        : "";

      const rowBg = index % 2 === 0 ? "#ffffff" : "#fafdf6";

      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};background:${rowBg};font-size:14px;color:${BRAND.text};">
            <strong>${name}</strong>${modifiersHtml}
          </td>
          <td align="center" style="padding:12px 8px;border-bottom:1px solid ${BRAND.border};background:${rowBg};font-size:14px;color:${BRAND.text};white-space:nowrap;">${quantity}</td>
          <td align="right" style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};background:${rowBg};font-size:14px;color:${BRAND.text};white-space:nowrap;">${money(lineTotal)}</td>
        </tr>`;
    })
    .join("");
}

function buildTotalRow(label, value, opts = {}) {
  const color = opts.color || BRAND.text;
  const weight = opts.bold ? "700" : "400";
  const size = opts.bold ? "16px" : "14px";
  const topBorder = opts.divider
    ? `border-top:2px solid ${BRAND.border};`
    : "";
  return `
    <tr>
      <td style="padding:6px 0;font-size:${size};color:${BRAND.muted};${topBorder}">${esc(label)}</td>
      <td align="right" style="padding:6px 0;font-size:${size};font-weight:${weight};color:${color};${topBorder}">${value}</td>
    </tr>`;
}

/**
 * @param {object} order - the saved Mongoose order document (or plain object)
 * @param {object} [options]
 * @param {string} [options.logoCid] - CID of an inline logo attachment (e.g. "freshlogo")
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildOrderConfirmationEmail(order, options = {}) {
  const { logoCid } = options;

  const orderNo = order.orderNo || order._id || "";
  const customerName = order.fullName || "there";
  const orderType = order.orderType === "pickup" ? "Pickup" : "Delivery";
  const branchName =
    (order.branch && (order.branch.name || order.branch)) || "Main Branch";

  const subtotal = getNumber(order.subtotal);
  const tax = getNumber(order.tax);
  const deliveryFee = getNumber(order.deliveryFee);
  const discount = getNumber(order.discount) + getNumber(order.thresholdDiscount);
  const total = getNumber(order.total);
  const isDelivery = order.orderType !== "pickup";

  const placedOn = new Date(order.createdAt || Date.now()).toLocaleString(
    "en-PK",
    { dateStyle: "medium", timeStyle: "short" }
  );

  // Logo: prefer inline CID attachment, otherwise fall back to hosted URL.
  const logoSrc = logoCid
    ? `cid:${logoCid}`
    : `${COMPANY.website}/logo.png`;

  const totalsRows = [
    buildTotalRow("Subtotal", money(subtotal)),
    tax > 0 ? buildTotalRow("Tax", money(tax)) : "",
    isDelivery
      ? buildTotalRow(
          "Delivery Fee",
          deliveryFee === 0 ? "FREE" : money(deliveryFee)
        )
      : "",
    discount > 0
      ? buildTotalRow(`Discount`, `- ${money(discount)}`, { color: BRAND.greenLight })
      : "",
    order.promoCode
      ? buildTotalRow("Promo Code", esc(order.promoCode), { color: BRAND.greenLight })
      : "",
    buildTotalRow("Total", money(total), { bold: true, divider: true }),
  ].join("");

  const addressBlock = isDelivery
    ? `
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Delivery Address</p>
        <p style="margin:0 0 12px;font-size:14px;color:${BRAND.text};line-height:1.5;">${esc(order.deliveryAddress || "—")}${
          order.nearestLandmark
            ? `<br/><span style="color:${BRAND.muted};">Landmark: ${esc(order.nearestLandmark)}</span>`
            : ""
        }</p>`
    : `
        <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Pickup Branch</p>
        <p style="margin:0 0 12px;font-size:14px;color:${BRAND.text};line-height:1.5;">${esc(branchName)}</p>`;

  const paymentLabel =
    order.paymentMethod === "online"
      ? `Online Payment${order.bankName ? ` (${esc(order.bankName)})` : ""}`
      : "Cash on Delivery";

  const subject = `Order Confirmed #${orderNo} — ${COMPANY.name}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your ${COMPANY.name} order #${esc(orderNo)} is confirmed. Total ${money(total)}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(20,40,10,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND.green};background-image:linear-gradient(135deg,${BRAND.greenLight},${BRAND.greenDark});padding:28px 32px;text-align:center;">
              <img src="${logoSrc}" alt="${COMPANY.name}" width="64" height="64" style="display:inline-block;height:64px;width:auto;max-width:160px;border:0;background:#ffffff;border-radius:12px;padding:6px;"/>
              <div style="margin-top:12px;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:.02em;">${COMPANY.name}</div>
              <div style="color:#eaf5d8;font-size:13px;margin-top:2px;">${COMPANY.tagline}</div>
            </td>
          </tr>

          <!-- Confirmation banner -->
          <tr>
            <td style="padding:32px 32px 8px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:${BRAND.bg};color:${BRAND.green};font-size:28px;font-weight:700;">&#10003;</div>
              <h1 style="margin:16px 0 6px;font-size:22px;color:${BRAND.text};">Thank you, ${esc(customerName)}!</h1>
              <p style="margin:0;font-size:15px;color:${BRAND.muted};line-height:1.6;">Your order has been received and is being prepared.<br/>We'll let you know as soon as it's on the way.</p>
            </td>
          </tr>

          <!-- Order meta -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:${BRAND.muted};">Order Number<br/><span style="font-size:18px;font-weight:700;color:${BRAND.green};">#${esc(orderNo)}</span></td>
                  <td align="right" style="padding:16px 20px;font-size:13px;color:${BRAND.muted};">Placed On<br/><span style="font-size:14px;font-weight:600;color:${BRAND.text};">${esc(placedOn)}</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:16px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:15px;color:${BRAND.text};text-transform:uppercase;letter-spacing:.05em;">Order Summary</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
                <thead>
                  <tr>
                    <th align="left" style="padding:10px 16px;background:#f3f4f6;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Item</th>
                    <th align="center" style="padding:10px 8px;background:#f3f4f6;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Qty</th>
                    <th align="right" style="padding:10px 16px;background:#f3f4f6;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemRows(order.items)}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:16px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${totalsRows}
              </table>
            </td>
          </tr>

          <!-- Delivery + payment -->
          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top" width="50%" style="padding:16px;background:${BRAND.bg};border-radius:12px;">
                    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">${esc(orderType)}</p>
                    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${BRAND.green};">${esc(branchName)}</p>
                    ${addressBlock}
                  </td>
                  <td width="12"></td>
                  <td valign="top" width="50%" style="padding:16px;background:${BRAND.bg};border-radius:12px;">
                    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Payment</p>
                    <p style="margin:0 0 12px;font-size:14px;color:${BRAND.text};">${paymentLabel}</p>
                    <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:.04em;">Contact</p>
                    <p style="margin:0;font-size:14px;color:${BRAND.text};">${esc(order.mobileNumber || "—")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <a href="${COMPANY.website}/order/${esc(order._id || "")}" style="display:inline-block;background:${BRAND.green};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 32px;border-radius:10px;">Track Your Order</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;text-align:center;border-top:1px solid ${BRAND.border};margin-top:16px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${BRAND.text};">${COMPANY.name}</p>
              <p style="margin:0 0 4px;font-size:13px;color:${BRAND.muted};">${COMPANY.address}</p>
              <p style="margin:0 0 12px;font-size:13px;color:${BRAND.muted};">
                <a href="tel:${COMPANY.phone.replace(/\s/g, "")}" style="color:${BRAND.green};text-decoration:none;">${COMPANY.phone}</a>
                &nbsp;&bull;&nbsp;
                <a href="${COMPANY.website}" style="color:${BRAND.green};text-decoration:none;">freshs.pk</a>
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${COMPANY.name}. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Thank you, ${customerName}!`,
    `Your ${COMPANY.name} order #${orderNo} is confirmed.`,
    ``,
    `Placed on: ${placedOn}`,
    `Type: ${orderType} (${branchName})`,
    ``,
    `Items:`,
    ...(order.items || []).map((item) => {
      const qty = getNumber(item.quantity, 1);
      const price = getNumber(item.price);
      return `  - ${item.title || item.name || "Item"} x${qty}  ${money(price * qty)}`;
    }),
    ``,
    `Subtotal: ${money(subtotal)}`,
    tax > 0 ? `Tax: ${money(tax)}` : "",
    isDelivery ? `Delivery Fee: ${deliveryFee === 0 ? "FREE" : money(deliveryFee)}` : "",
    discount > 0 ? `Discount: -${money(discount)}` : "",
    `Total: ${money(total)}`,
    ``,
    `Payment: ${order.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}`,
    isDelivery ? `Delivery to: ${order.deliveryAddress || "—"}` : "",
    ``,
    `${COMPANY.name} · ${COMPANY.address} · ${COMPANY.phone}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
