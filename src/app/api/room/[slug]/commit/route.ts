import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: { slug: string } }) {
    const { slug } = await context.params;
    try {
        const { message, fileIds, userId } = await req.json();
        const room = await prisma.room.findUnique({
            where: { slug },
            include: { files: true }
        });

        if(!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const latestCommit = await prisma.commit.findFirst({
            where: { roomId: room.id },
            orderBy: { createdAt: "desc" },
            include: { files: true }
        });

        const changedFiles = room.files.filter(file => {
            if (!fileIds.includes(file.id)) return false;
            const previous = latestCommit?.files.find(f => f.fileId === file.id);
            return !previous || previous.content !== file.content;
        });

        if (changedFiles.length === 0) {
            return NextResponse.json({ message: "No changes to commit" }, { status: 200 });
        }

        const commit = await prisma.commit.create({
            data: {
              message,
              roomId: room.id,
              userId,
              files: {
                create: changedFiles.map(file => {
                  const previous = latestCommit?.files.find(f => f.fileId === file.id);
                  return {
                    name: file.name,
                    language: file.language ?? '',
                    content: file.content ?? '',
                    oldContent: previous?.content ?? '',
                    fileId: file.id
                }})
              }
            },
            include: { files: true }
        });

        return NextResponse.json(commit);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create commit" }, { status: 500 })
    }
}

export async function GET(req: Request, context: { params: { slug: string } }) {
    const { slug } = await context.params;
    try {
        const room = await prisma.room.findUnique({
            where: { slug },
            include: {
              commits: {
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  message: true,
                  createdAt: true,
                  user: { select: { id: true, name: true, email: true } }
                }
              }
            }
          });

          if(!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
          }

          return NextResponse.json(room.commits);
    } catch (error) { 
        return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 });
    }
}