import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('Admin email:', process.env.ADMIN_EMAIL);

    const { data, error } = await resend.emails.send({
from: 'contact@huvdesignoffice.com',
to: [process.env.ADMIN_EMAIL || 'delivered@resend.dev'],
      subject: 'テストメール from Brand Check',
      html: '<p>これはテストメールです</p>',
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}