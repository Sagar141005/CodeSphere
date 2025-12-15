import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  _: Request,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    const room = await prisma.room.findUnique({
      where: { slug },
      include: { files: true },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const targetCommit = await prisma.commit.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!targetCommit) {
      return NextResponse.json({ error: "Commit not found" }, { status: 404 });
    }

    for (const file of targetCommit.files) {
      const existingFile = room.files.find((f) => f.id === file.fileId);
      if (existingFile) {
        await prisma.file.update({
          where: { id: existingFile.id },
          data: {
            name: file.name,
            language: file.language,
            content: file.content,
          },
        });
      }
    }

    await prisma.commit.create({
      data: {
        roomId: room.id,
        userId: userId || "system",
        message: `Reverted to: ${targetCommit.message}`,
        files: {
          create: targetCommit.files.map((f) => ({
            fileId: f.fileId,
            name: f.name,
            content: f.content,
            language: f.language,
            oldContent: f.oldContent,
          })),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to revert" }, { status: 500 });
  }
}
