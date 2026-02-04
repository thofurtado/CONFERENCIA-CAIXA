import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const dbSize = await kv.dbsize();
        const keys = await kv.keys('*');

        return NextResponse.json({
            status: 'Conectado',
            total_chaves: dbSize,
            exemplo_chaves: keys.slice(0, 10),
            env_url_usada: process.env.KV_REST_API_URL,
            kv_url_env: process.env.KV_URL, // Adding this just in case
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'Erro',
            error: error.message,
            env_url_usada: process.env.KV_REST_API_URL,
        }, { status: 500 });
    }
}
