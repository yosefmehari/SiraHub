import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category') || undefined;
    const subCity = searchParams.get('subCity') || undefined;
    const availableOnly = searchParams.get('available') === 'true';
    const minRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;
    const search = searchParams.get('search') || undefined;

    const technicians = await dbService.getTechnicians({
      categorySlug,
      subCity,
      availableOnly,
      minRating,
      search,
    });

    return NextResponse.json(technicians);
  } catch (error) {
    console.error('Fetch technicians error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technicians' },
      { status: 500 }
    );
  }
}
