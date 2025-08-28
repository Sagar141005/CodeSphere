import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    return NextResponse.json({ ok: true, users });
  } catch (err: any) {
    console.error("DB Test Error:", err);
    return NextResponse.json({ error: String(err.message) }, { status: 500 });
  }
}
