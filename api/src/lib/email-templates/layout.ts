import { EMAIL_BRAND, escHtml, siteUrl } from './brand.js';

export interface EmailLayoutOptions {
  preheader: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  cta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  footerNote?: string;
}

function renderButton(href: string, label: string, primary = true): string {
  const bg = primary ? EMAIL_BRAND.colors.champagne : EMAIL_BRAND.colors.white;
  const color = primary ? EMAIL_BRAND.colors.black : EMAIL_BRAND.colors.charcoal;
  const border = primary ? EMAIL_BRAND.colors.champagne : EMAIL_BRAND.colors.border;

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto 0;">
      <tr>
        <td style="border-radius:999px;background:${bg};border:1px solid ${border};">
          <a href="${escHtml(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${color};text-decoration:none;letter-spacing:0.02em;">
            ${escHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const url = siteUrl();
  const preheader = escHtml(options.preheader);
  const eyebrow = options.eyebrow ? escHtml(options.eyebrow) : '';
  const title = escHtml(options.title);
  const footerNote = options.footerNote
    ? `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${EMAIL_BRAND.colors.muted};">${escHtml(options.footerNote)}</p>`
    : '';

  const ctaBlock = options.cta ? renderButton(options.cta.href, options.cta.label, true) : '';
  const secondaryCtaBlock = options.secondaryCta
    ? `<p style="margin:18px 0 0;text-align:center;">
        <a href="${escHtml(options.secondaryCta.href)}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:${EMAIL_BRAND.colors.charcoal};text-decoration:underline;">
          ${escHtml(options.secondaryCta.label)}
        </a>
      </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.colors.sand};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${EMAIL_BRAND.colors.sand};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <tr>
            <td style="border-radius:20px 20px 0 0;background:${EMAIL_BRAND.colors.black};padding:28px 32px 24px;text-align:center;">
              <a href="${escHtml(url)}" target="_blank" style="text-decoration:none;">
                <span style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:12px;background:#141414;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:${EMAIL_BRAND.colors.champagne};">E</span>
              </a>
              <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:500;letter-spacing:0.18em;color:${EMAIL_BRAND.colors.white};">${EMAIL_BRAND.name.toUpperCase()}</p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${EMAIL_BRAND.colors.champagneLight};">${EMAIL_BRAND.tagline}</p>
            </td>
          </tr>
          <tr>
            <td style="background:${EMAIL_BRAND.colors.cream};padding:36px 32px 32px;border-left:1px solid ${EMAIL_BRAND.colors.border};border-right:1px solid ${EMAIL_BRAND.colors.border};">
              ${eyebrow ? `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_BRAND.colors.champagne};">${eyebrow}</p>` : ''}
              <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:500;color:${EMAIL_BRAND.colors.charcoal};">${title}</h1>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${EMAIL_BRAND.colors.charcoal};">
                ${options.bodyHtml}
              </div>
              ${ctaBlock}
              ${secondaryCtaBlock}
              ${footerNote}
            </td>
          </tr>
          <tr>
            <td style="border-radius:0 0 20px 20px;background:${EMAIL_BRAND.colors.cream};padding:0 32px 28px;border:1px solid ${EMAIL_BRAND.colors.border};border-top:none;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid ${EMAIL_BRAND.colors.border};">
                <tr>
                  <td style="padding-top:22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${EMAIL_BRAND.colors.muted};text-align:center;">
                    <p style="margin:0 0 8px;">¿Necesitas ayuda? Escríbenos a <a href="mailto:${EMAIL_BRAND.supportEmail}" style="color:${EMAIL_BRAND.colors.charcoal};">${EMAIL_BRAND.supportEmail}</a></p>
                    <p style="margin:0 0 8px;">
                      <a href="${escHtml(url)}/legal/faq" style="color:${EMAIL_BRAND.colors.muted};text-decoration:underline;">FAQ</a>
                      &nbsp;·&nbsp;
                      <a href="${escHtml(url)}/legal/privacy" style="color:${EMAIL_BRAND.colors.muted};text-decoration:underline;">Privacidad</a>
                      &nbsp;·&nbsp;
                      <a href="${escHtml(url)}/legal/terms" style="color:${EMAIL_BRAND.colors.muted};text-decoration:underline;">Términos</a>
                    </p>
                    <p style="margin:0;">© ${new Date().getFullYear()} ${EMAIL_BRAND.name}. Experiencias de glamping en Colombia.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderInfoCard(rows: Array<{ label: string; value: string }>): string {
  const items = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BRAND.colors.border};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.colors.muted};width:38%;vertical-align:top;">
          ${escHtml(row.label)}
        </td>
        <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${EMAIL_BRAND.colors.border};font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${EMAIL_BRAND.colors.charcoal};vertical-align:top;">
          ${escHtml(row.value)}
        </td>
      </tr>`,
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 0;border:1px solid ${EMAIL_BRAND.colors.border};border-radius:14px;background:${EMAIL_BRAND.colors.white};overflow:hidden;">
      <tr><td style="padding:4px 18px 8px;">${items}</td></tr>
    </table>`;
}

export function renderHighlightBox(html: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 0;">
      <tr>
        <td style="padding:16px 18px;border-radius:14px;background:${EMAIL_BRAND.colors.sand};border:1px solid ${EMAIL_BRAND.colors.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:${EMAIL_BRAND.colors.charcoal};">
          ${html}
        </td>
      </tr>
    </table>`;
}
