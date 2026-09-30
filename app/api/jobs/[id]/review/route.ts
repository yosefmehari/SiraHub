import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { rating, comment, clientId, technicianId } = body;

    if (!rating || !technicianId) {
      return NextResponse.json(
        { error: 'Missing rating or technicianId' },
        { status: 400 }
      );
    }

    const review = await dbService.addReview({
      jobId: params.id,
      clientId: clientId || 'usr-client-1',
      technicianId,
      rating: Number(rating),
      comment: comment || '',
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
