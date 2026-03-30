import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();
  
  try {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    
    await db.collection('leads').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const client = await clientPromise;
    const db = client.db('lead_stats');
    
    await db.collection('leads').deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}