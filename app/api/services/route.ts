import { NextResponse } from 'next/server';
import { ServiceModel } from '@/lib/models/service';

export async function GET() {
  try {
    const services = await ServiceModel.getAll();
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, image } = await req.json();
    
    if (!title || !description || !image) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    await ServiceModel.create({ title, description, image, order: 0 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}