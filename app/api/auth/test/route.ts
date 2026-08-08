import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const c = await cookies();
    c.set('test_cookie', 'value', { httpOnly: true });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, name: e.name, stack: e.stack }, { status: 500 });
  }
}
