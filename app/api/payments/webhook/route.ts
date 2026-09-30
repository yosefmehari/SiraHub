import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tx_ref, status } = body;

    if (!tx_ref) {
      return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 });
    }

    // Extract jobId from tx_ref format: SIRAHUB-${jobId}-${timestamp}
    const parts = tx_ref.split('-');
    const jobId = parts[1];

    if (status === 'success' || status === 'completed') {
      if (jobId) {
        await dbService.markJobPaidEscrow(jobId, 'CHAPA', tx_ref);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
