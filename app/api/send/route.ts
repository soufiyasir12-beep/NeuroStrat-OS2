import { NextResponse } from 'next/server';

const RESEND_API_KEY = "re_JHMUm8yw_AFxUDymyYzkXZY6mdakeQXpx";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Neurostrat OS <onboarding@resend.dev>',
        to: to, // Expecting an array of strings or a single string
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to send email via Resend' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}