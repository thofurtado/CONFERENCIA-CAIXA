import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const backupData = await request.json();

        if (!Array.isArray(backupData)) {
            return NextResponse.json(
                { error: 'Formato de arquivo inválido' },
                { status: 400 }
            );
        }

        const pipeline = kv.pipeline();

        // Itera sobre o backup e adiciona comandos ao pipeline
        for (const item of backupData) {
            if (item.key && item.value) {
                pipeline.set(item.key, item.value);
            }
        }

        // Executa todas as operações de uma vez
        await pipeline.exec();

        return NextResponse.json({ success: true, count: backupData.length });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: 'Falha ao importar dados' },
            { status: 500 }
        );
    }
}
