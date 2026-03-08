import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { to, from, subject, html } = req.body;

    // Retrieve the API Key from environment variables
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'Server configuration error: Missing Resend API Key' });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from, // Use the dynamic sender selected in frontend
        to: to,
        subject: subject,
        html: html,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({ message: data.message || 'Failed to send email via Resend' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
