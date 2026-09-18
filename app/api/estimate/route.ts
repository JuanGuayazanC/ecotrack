import { NextResponse } from "next/server";
import { estimateFromDiary } from "@/lib/estimate";

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string };
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json(
      { error: "Escribe cómo fue tu día." },
      { status: 400 },
    );
  }

  return NextResponse.json(estimateFromDiary(text));
}
