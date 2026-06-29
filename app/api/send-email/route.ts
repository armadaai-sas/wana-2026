import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('Email request received:', body);

  return NextResponse.json({ status: 'queued' });
}
