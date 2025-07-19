import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params; 
    try {
        const room = await prisma.room.findUnique({
            where: { slug },
            include: { files: true }
        });

        if(!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });   

        return NextResponse.json(room.files);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });   
    }   
}

export async function POST(req: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params; 
    try {
        const { name, parentId } = await req.json();
        const room = await prisma.room.findUnique({ where: { slug } });

        if(!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
        
        const isFile = name.includes(".");
        const newFile = await prisma.file.create({
            data: {
                name,
                type: isFile ? "file" : "folder",
                parentId,
                roomId: room.id
            }
        });

        return NextResponse.json(newFile);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
    }
}