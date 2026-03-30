import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    const reviews = await db.collection('reviews').find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, rating, text } = await req.json();
    const client = await clientPromise;
    const db = client.db('lead_stats');
    
    await db.collection('reviews').insertOne({
      name,
      rating,
      text,
      status: 'pending',
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}