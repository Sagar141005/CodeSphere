import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params; // ✅ Await params
  try {
    const room = await prisma.room.findUnique({
      where: { slug },
      select: { name: true, content: true, slug: true } 
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params; // ✅ Await params
  try {
    const { content } = await req.json();

    const updatedRoom = await prisma.room.update({
      where: { slug },
      data: { content },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
