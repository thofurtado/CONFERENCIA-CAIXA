import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const CAIXA_KEY = 'caixa_data_v1';

export async function GET() {
    try {
        const data = await kv.get(CAIXA_KEY);
        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao ler banco' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await kv.set(CAIXA_KEY, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao salvar banco' }, { status: 500 });
    }
}