import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


async function deleteRecursive(id: string) {
    const children = await prisma.file.findMany({ where: { parentId: id } });

    for(const child of children) {
        await deleteRecursive(child.id);
    }

    await prisma.file.delete({ where: { id } });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const file = await prisma.file.findUnique({ where: { id } });
  return NextResponse.json(file || {});
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { content, language, name } = await req.json();
    try {
        const updatedFile = await prisma.file.update({
          where: { id },
          data: {
            ...(content !== undefined ? { content } : {}),
            ...(language !== undefined ? { language } : {}),
            ...(name !== undefined ? { name } : {})
          },
        });
    
        return NextResponse.json(updatedFile);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
    }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        await deleteRecursive(id)

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}