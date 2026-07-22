import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "Atelier <onboarding@resend.dev>";

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    isCustom: boolean;
  }[];
  subtotal: number;
  totalAmount: number;
  shippingAddress: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email.");
    return;
  }

  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0ebe4;font-size:14px;color:#111111;">
            ${item.productName}${item.isCustom ? ' <span style="color:#999;font-size:11px;">(Custom)</span>' : ''}
            <br/><span style="color:#888;font-size:12px;">${item.color || ''} · ${item.size || ''} · Qty ${item.quantity}</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0ebe4;font-size:14px;color:#111111;text-align:right;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f1ea;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:#111111;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:600;color:#ffffff;letter-spacing:-0.5px;">Atelier</h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#111111;">Order Confirmed ✓</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#666666;">Hi ${data.customerName}, thank you for your order! We're getting started on it right away.</p>

      <div style="background:#faf7f2;border-radius:6px;padding:16px 0;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:8px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Item</th>
              <th style="padding:8px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#666;">Subtotal</td>
          <td style="padding:6px 0;font-size:14px;color:#666;text-align:right;">₹${data.subtotal.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:16px;font-weight:600;color:#111;">Total</td>
          <td style="padding:6px 0;font-size:16px;font-weight:600;color:#111;text-align:right;">₹${data.totalAmount.toLocaleString("en-IN")}</td>
        </tr>
      </table>

      <div style="border-top:1px solid #f0ebe4;padding-top:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Shipping Address</p>
        <p style="margin:0;font-size:14px;color:#111;white-space:pre-line;">${data.shippingAddress}</p>
      </div>

      <div style="border-top:1px solid #f0ebe4;padding-top:20px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Order ID</p>
        <p style="margin:0;font-size:13px;color:#111;font-family:monospace;">${data.orderId}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#faf7f2;padding:24px 40px;text-align:center;border-top:1px solid #f0ebe4;">
      <p style="margin:0;font-size:12px;color:#999;">Questions? Reply to this email and we'll get back to you.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed — #${data.orderId.slice(0, 8)}`,
      html,
    });
    if (error) {
      console.error("[email] Failed to send confirmation:", error);
    }
  } catch (err) {
    console.error("[email] Error sending confirmation email:", err);
  }
}

export async function sendOrderFailedEmail(data: { customerName: string; customerEmail: string; orderId: string }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping order failed email.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f1ea;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="background:#111111;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:600;color:#ffffff;letter-spacing:-0.5px;">Atelier</h1>
    </div>
    <div style="padding:40px;">
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#dc2626;">Payment Failed</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#666666;">Hi ${data.customerName}, unfortunately your payment for order <strong>#${data.orderId.slice(0, 8)}</strong> could not be processed.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#666666;">Please try again or use a different payment method. Your items are still reserved for a limited time.</p>
      <div style="text-align:center;">
        <a href="/cart" style="display:inline-block;padding:14px 32px;background:#111111;color:#ffffff;text-decoration:none;border-radius:4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Try Again</a>
      </div>
    </div>
    <div style="background:#faf7f2;padding:24px 40px;text-align:center;border-top:1px solid #f0ebe4;">
      <p style="margin:0;font-size:12px;color:#999;">Need help? Reply to this email and we'll assist you.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Payment Failed — Order #${data.orderId.slice(0, 8)}`,
      html,
    });
    if (error) {
      console.error("[email] Failed to send payment-failed email:", error);
    }
  } catch (err) {
    console.error("[email] Error sending payment-failed email:", err);
  }
}
