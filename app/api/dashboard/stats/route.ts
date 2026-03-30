import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { StatModel } from '@/lib/models/stats';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('lead_stats');

    const [leadsCount, servicesCount, newsCount, pendingReviewsCount, reviewsCount, stats] = await Promise.all([
      db.collection('leads').countDocuments(),
      db.collection('services').countDocuments(),
      db.collection('news').countDocuments(),
      db.collection('reviews').countDocuments({ status: 'pending' }),
      db.collection('reviews').countDocuments({ status: 'approved' }),
      StatModel.getDailyStats()
    ]);

    return NextResponse.json({
      activeBids: leadsCount,
      servicesCount,
      newsCount,
      activeReviews: reviewsCount,
      pendingReviews: pendingReviewsCount,
      usersToday: stats.unique.today,
      usersWeek: stats.unique.week,
      usersMonth: stats.unique.month
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}