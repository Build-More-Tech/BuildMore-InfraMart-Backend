const nodemailer = require('nodemailer');

// Create transporter from env vars; falls back to a no-op in development
// Required env vars: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
function createTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

async function sendMail({ to, subject, html }) {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn(`[EMAIL] Transporter not configured. Would send "${subject}" to ${to}`);
        return;
    }
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
}

// ── Templated helpers ─────────────────────────────────────────────────────────

async function sendOTP(to, otp) {
    await sendMail({
        to,
        subject: 'BuildMore – Password Reset Code',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="color:#facc15">Password Reset</h2>
                <p>Use the following code to reset your password. It expires in <strong>15 minutes</strong>.</p>
                <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 0">${otp}</div>
                <p style="color:#6b7280;font-size:12px">If you did not request this, ignore this email.</p>
            </div>
        `,
    });
}

async function sendOrderConfirmation(to, order) {
    const itemsHtml = order.items.map(i =>
        `<tr><td>${i.productName}</td><td>×${i.quantity}</td><td>₹${(i.price * i.quantity).toFixed(2)}</td></tr>`
    ).join('');

    await sendMail({
        to,
        subject: `BuildMore – Order ${order.orderNumber} Confirmed`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:auto">
                <h2 style="color:#facc15">Order Confirmed!</h2>
                <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead><tr style="background:#f3f4f6"><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                    <tfoot><tr><td colspan="2"><strong>Total</strong></td><td><strong>₹${order.totalAmount.toFixed(2)}</strong></td></tr></tfoot>
                </table>
                <p style="color:#6b7280;font-size:12px">You can track your order in your profile.</p>
            </div>
        `,
    });
}

async function sendOrderStatusUpdate(to, order) {
    await sendMail({
        to,
        subject: `BuildMore – Order ${order.orderNumber} Status Update`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="color:#facc15">Order Update</h2>
                <p>Your order <strong>${order.orderNumber}</strong> status has changed to <strong>${order.status}</strong>.</p>
                <p style="color:#6b7280;font-size:12px">Log in to BuildMore to view details.</p>
            </div>
        `,
    });
}

async function sendRFQQuoted(to, rfq) {
    await sendMail({
        to,
        subject: `BuildMore – RFQ ${rfq.rfqNumber} Has Been Quoted`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="color:#facc15">Your RFQ Has Been Quoted</h2>
                <p>RFQ <strong>${rfq.rfqNumber}</strong> has received a quote. Log in to review and accept or reject it.</p>
                ${rfq.adminNotes ? `<p><em>Admin notes: ${rfq.adminNotes}</em></p>` : ''}
            </div>
        `,
    });
}

module.exports = { sendOTP, sendOrderConfirmation, sendOrderStatusUpdate, sendRFQQuoted };
