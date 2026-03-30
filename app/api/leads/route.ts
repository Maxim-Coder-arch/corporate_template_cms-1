import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    const leads = await db.collection('leads').find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();
    const client = await clientPromise;
    const db = client.db('lead_stats');
    
    await db.collection('leads').insertOne({
      name,
      email,
      phone,
      message,
      status: 'new',
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}