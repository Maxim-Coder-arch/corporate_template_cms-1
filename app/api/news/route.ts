import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db =client.db("lead_stats");
    const news = await db.collection("news").find().sort({ createdAt: -1 }).toArray();

    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ message: "Не удалось получить новости" }, { status: 500 });
  }
}




export async function POST(req: Request) {
  try {
    const {
      title,
      description
    } = await req.json();
    const client  = await clientPromise;
    const db = client.db("lead_stats");

    await db.collection("news").insertOne({
      title,
      description,
      createdAt: new Date()
    });

    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({ message: "Не удалось добавить новость" }, { status: 500 });
  }
}