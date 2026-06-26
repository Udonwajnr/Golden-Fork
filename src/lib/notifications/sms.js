/**
 * SMS via Twilio if env vars are set, otherwise logs to console.
 * Kept dependency-free (no twilio SDK install) by calling Twilio's REST API directly.
 */
export async function sendSms({ to, body }) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !to) {
    console.log(`[sms:stub] to=${to} body="${body}"`);
    return { stubbed: true };
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString(
      "base64"
    );
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: TWILIO_FROM_NUMBER, Body: body }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return { sent: true };
  } catch (err) {
    console.error("[sms] send failed", err);
    return { sent: false, error: err.message };
  }
}
