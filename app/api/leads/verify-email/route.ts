import { NextRequest, NextResponse } from 'next/server';
import { emailVerifier } from '@/lib/email-verifier';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const result = await emailVerifier.verifyEmail(email);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
