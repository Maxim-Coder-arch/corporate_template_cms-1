import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', process.env.IMGBB_API_KEY!);
    imgbbFormData.append('image', base64);
    imgbbFormData.append('expiration', '0');
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('ImgBB error:', data);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
    
    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}