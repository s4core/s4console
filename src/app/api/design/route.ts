import { NextResponse } from 'next/server';

export async function GET() {
  const designOld = process.env.DESIGN_OLD === 'true';
  return NextResponse.json({ designOld });
}
