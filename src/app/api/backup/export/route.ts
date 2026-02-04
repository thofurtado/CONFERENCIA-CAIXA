import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const keys = await kv.keys('*');
        const backupData = [];

        if (keys && keys.length > 0) {
            for (const key of keys) {
                const value = await kv.get(key);
                backupData.push({ key, value });
            }
        }

        return NextResponse.json(backupData, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="backup-conferencia.json"',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json(
            { error: 'Failed to generate backup' },
            { status: 500 }
        );
    }
}
