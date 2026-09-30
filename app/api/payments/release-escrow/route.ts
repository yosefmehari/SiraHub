import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { jobId, payoutMethod = 'TELEBIRR', clientConfirmationNotes } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const job = await dbService.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.paymentStatus === 'RELEASED') {
      return NextResponse.json(
        { message: 'Funds have already been released for this job' },
        { status: 400 }
      );
    }

    // Calculate 10% platform commission and 90% technician payout
    const totalAmount = job.agreedPrice;
    const commissionFee = Math.round(totalAmount * 0.1);
    const technicianPayout = totalAmount - commissionFee;

    // Release escrow and update job & transaction records
    const updatedJob = await dbService.releaseEscrowPayout(jobId);

    // Simulated Telebirr / Bank B2C Payout API transfer
    const payoutTransferRef = `TELEBIRR-PAYOUT-${job.technicianId}-${Date.now()}`;

    return NextResponse.json({
      status: 'success',
      message: 'Escrow released successfully to technician',
      data: {
        job: updatedJob,
        payoutSummary: {
          totalAmount,
          currency: 'ETB',
          commissionRate: '10%',
          commissionFee,
          technicianPayout,
          payoutMethod,
          transferRef: payoutTransferRef,
          releasedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Escrow release error:', error);
    return NextResponse.json(
      { error: 'Failed to release escrow funds' },
      { status: 500 }
    );
  }
}
