import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{id: string}> }
) {
  const { id } = await params;
  try {
    const client = await clientPromise;
    const db = client.db("lead_stats");
    await db.collection("news").deleteOne({_id: new ObjectId(id)});
    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({ message: "Не удалось удалить новость" }, { status: 500 });
  }
}