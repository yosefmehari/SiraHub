import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const technician = await dbService.getTechnicianById(params.id);
    if (!technician) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(technician);
  } catch (error) {
    console.error('Fetch technician details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technician details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { isAvailable } = body;

    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing isAvailable boolean' },
        { status: 400 }
      );
    }

    const updated = await dbService.toggleTechnicianAvailability(params.id, isAvailable);
    if (!updated) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update technician error:', error);
    return NextResponse.json(
      { error: 'Failed to update technician' },
      { status: 500 }
    );
  }
}
