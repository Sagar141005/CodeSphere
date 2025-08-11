import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(_: Request, context: { params: { slug: string, id: string } }) {
  const { slug, id } = await context.params;
  try {
    const room = await prisma.room.findUnique({
        where: { slug },
        include: { files: true }
    });
    if(!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    const commit = await prisma.commit.findUnique({
        where: { id },
        include: { files: true }
    });
    if(!commit) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    for(const file of commit.files) {
        const existingFile = room.files.find(f => f.id === file.fileId);
        if(existingFile) {
            await prisma.file.update({
                where: { id: existingFile.id },
                data: {
                    name: file.name,
                    language: file.language,
                    content: file.content
                }
            })
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to revert" }, { status: 500 });
  }
}