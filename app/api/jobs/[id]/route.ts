import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { JobStatus } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await dbService.getJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error('Fetch job error:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const updatedJob = await dbService.updateJobStatus(params.id, status as JobStatus);
    if (!updatedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Update job status error:', error);
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
  }
}
