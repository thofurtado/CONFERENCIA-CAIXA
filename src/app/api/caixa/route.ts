import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const CAIXA_KEY = 'caixa_data_v1';

export async function GET() {
    const data = await kv.get(CAIXA_KEY);
    return NextResponse.json(data || []);
}

export async function POST(request: Request) {
    const body = await request.json();
    await kv.set(CAIXA_KEY, body);
    return NextResponse.json({ success: true });
}