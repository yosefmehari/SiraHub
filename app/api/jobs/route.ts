import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId') || undefined;
    const technicianId = searchParams.get('technicianId') || undefined;

    const jobs = await dbService.getJobs({ clientId, technicianId });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientId = 'usr-client-1',
      technicianId,
      categoryId,
      title,
      description,
      issuePhotoUrl,
      address,
      subCity,
      woreda,
      agreedPrice,
    } = body;

    if (!technicianId || !categoryId || !title || !description || !address || !subCity || !agreedPrice) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const newJob = await dbService.createJob({
      clientId,
      technicianId,
      categoryId,
      title,
      description,
      issuePhotoUrl,
      address,
      subCity,
      woreda,
      agreedPrice: Number(agreedPrice),
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
