import { NextResponse } from "next/server";
import { estimateFromDiary } from "@/lib/estimate";

const MAX_TEXT_LENGTH = 2000;

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer la solicitud." },
      { status: 400 },
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json(
      { error: "Escribe cómo fue tu día." },
      { status: 400 },
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `El texto es demasiado largo (máximo ${MAX_TEXT_LENGTH} caracteres).` },
      { status: 400 },
    );
  }

  return NextResponse.json(estimateFromDiary(text));
}
