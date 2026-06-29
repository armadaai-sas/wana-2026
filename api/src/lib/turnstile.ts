export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  if (!token) return false;

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });

  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export function turnstileRequired(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}
