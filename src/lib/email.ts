// src/lib/email.ts
// Emails transaccionales con Resend (https://resend.com — gratis 3.000/mes)
// npm install resend

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Vendó <noreply@vendo.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vendo.app";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY no configurada. Omitiendo email.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Email] Error Resend:", err);
      return false;
    }

    console.log(`[Email] Enviado a ${to}: "${subject}"`);
    return true;
  } catch (err) {
    console.error("[Email] Error de red:", err);
    return false;
  }
}

// ─── Templates ─────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'DM Sans', -apple-system, sans-serif;
  max-width: 560px; margin: 0 auto; padding: 40px 20px;
  color: #0E1117;
`;

const btnStyle = `
  display: inline-block; background: #0ABF6E; color: white;
  padding: 12px 28px; border-radius: 10px; text-decoration: none;
  font-weight: 600; font-size: 15px; margin: 8px 0;
`;

function layout(content: string) {
  return `<!DOCTYPE html><html><body style="${baseStyle}">
    <div style="margin-bottom:32px">
      <span style="font-size:24px; font-weight:700; letter-spacing:-0.5px">
        vend<span style="color:#0ABF6E">ó</span>
      </span>
    </div>
    ${content}
    <div style="margin-top:40px; padding-top:24px; border-top:1px solid #e5e7eb; font-size:12px; color:#8A9099">
      <p>Vendó · Tu tienda digital con WhatsApp</p>
      <p><a href="${APP_URL}" style="color:#0ABF6E">vendo.app</a></p>
    </div>
  </body></html>`;
}

export async function sendWelcomeEmail(to: string, name: string, storeName: string, storeSlug: string) {
  return sendEmail({
    to,
    subject: `¡Bienvenido a Vendó, ${name.split(" ")[0]}! 🎉`,
    html: layout(`
      <h1 style="font-size:28px; margin-bottom:8px">¡Tu tienda está lista! 🎉</h1>
      <p style="color:#444; line-height:1.6; margin-bottom:24px">
        Hola ${name.split(" ")[0]}, <strong>${storeName}</strong> ya está en línea y lista para recibir pedidos.
      </p>
      <div style="background:#F7F8FA; border-radius:12px; padding:16px; margin-bottom:24px">
        <p style="margin:0 0 8px; font-size:12px; color:#8A9099">Tu link de tienda</p>
        <p style="margin:0; font-weight:600; color:#0ABF6E">${APP_URL}/s/${storeSlug}</p>
      </div>
      <p style="color:#444; margin-bottom:8px">Próximos pasos:</p>
      <ul style="color:#444; line-height:1.8; padding-left:20px">
        <li>Agregá tus primeros productos</li>
        <li>Compartí el link en Instagram y WhatsApp</li>
        <li>Imprimí el código QR para tu local</li>
      </ul>
      <div style="margin-top:28px">
        <a href="${APP_URL}/dashboard" style="${btnStyle}">Ir a mi panel →</a>
      </div>
    `),
  });
}

export async function sendTrialEndingEmail(to: string, name: string, daysLeft: number) {
  return sendEmail({
    to,
    subject: `Tu trial de Vendó vence en ${daysLeft} días ⏰`,
    html: layout(`
      <h1 style="font-size:24px; margin-bottom:8px">Tu período de prueba está por terminar</h1>
      <p style="color:#444; line-height:1.6; margin-bottom:24px">
        Hola ${name.split(" ")[0]}, te quedan <strong>${daysLeft} días</strong> de prueba gratuita en Vendó.
        Para no perder el acceso a tu tienda, elegí un plan.
      </p>
      <div style="background:#FEF9C3; border-radius:12px; padding:16px; margin-bottom:24px; border:1px solid #fde68a">
        <p style="margin:0; color:#92400E; font-size:14px">
          ⏰ Tu acceso vence en ${daysLeft} días. Después de eso, tu tienda quedará pausada.
        </p>
      </div>
      <a href="${APP_URL}/dashboard/billing" style="${btnStyle}">Elegir mi plan →</a>
      <p style="color:#8A9099; font-size:12px; margin-top:16px">
        Planes desde $4.900/mes · Sin comisión por venta · Cancelás cuando querés
      </p>
    `),
  });
}

export async function sendNewOrderEmail(
  to: string,
  storeName: string,
  orderNumber: number,
  customerName: string,
  items: { name: string; qty: number; price: number }[],
  total: number
) {
  const itemsHtml = items
    .map(i => `<tr>
      <td style="padding:8px 0; color:#444">${i.qty}× ${i.name}</td>
      <td style="padding:8px 0; text-align:right; font-weight:600">$${(i.price * i.qty / 100).toLocaleString("es-AR")}</td>
    </tr>`)
    .join("");

  return sendEmail({
    to,
    subject: `🛍️ Nuevo pedido #${orderNumber} de ${customerName}`,
    html: layout(`
      <div style="background:#E8FAF2; border-radius:12px; padding:16px; margin-bottom:24px; border:1px solid #0ABF6E30">
        <p style="margin:0; color:#07944F; font-weight:600; font-size:18px">
          🛍️ Nuevo pedido en ${storeName}
        </p>
        <p style="margin:4px 0 0; color:#07944F; font-size:14px">Pedido #${orderNumber}</p>
      </div>
      <p style="color:#444; margin-bottom:16px"><strong>Cliente:</strong> ${customerName}</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px">
        <thead>
          <tr style="border-bottom:1px solid #e5e7eb">
            <th style="text-align:left; padding:8px 0; font-size:12px; color:#8A9099">Producto</th>
            <th style="text-align:right; padding:8px 0; font-size:12px; color:#8A9099">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="border-top:2px solid #e5e7eb">
            <td style="padding:12px 0; font-weight:700; font-size:16px">Total</td>
            <td style="padding:12px 0; font-weight:700; font-size:16px; text-align:right; color:#0ABF6E">
              $${(total / 100).toLocaleString("es-AR")}
            </td>
          </tr>
        </tfoot>
      </table>
      <a href="${APP_URL}/dashboard/orders" style="${btnStyle}">Ver pedido en el panel →</a>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Restablecer tu contraseña de Vendó",
    html: layout(`
      <h1 style="font-size:24px; margin-bottom:8px">Restablecer contraseña</h1>
      <p style="color:#444; line-height:1.6; margin-bottom:24px">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Vendó.
        Si no fuiste vos, ignorá este email.
      </p>
      <a href="${resetUrl}" style="${btnStyle}">Restablecer contraseña →</a>
      <p style="color:#8A9099; font-size:12px; margin-top:16px">
        Este link vence en 1 hora por seguridad.
      </p>
    `),
  });
}
