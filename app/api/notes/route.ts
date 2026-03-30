import { NextResponse } from "next/server";
import { NoteModel } from "@/lib/models/note";

export async function GET() {
  try {
    const notes = await NoteModel.getAll();
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: "Не удалось получить заметки" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      text,
      priority
    } = await req.json();
    if (!text) return NextResponse.json({ error: "Текст не может быть пустым" }, { status: 400 });
    await NoteModel.create(text, priority || "medium");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Не удалось создать заметку" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Не удалось получить id заметки" }, { status: 400 });
    await NoteModel.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Не удалось удалить заметку" }, { status: 500 });
  }
}