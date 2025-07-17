import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { slug } = await req.json();
        if(!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if(!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if(!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newRoom = await prisma.room.create({
            data: {
                slug,
                ownerId: user.id
            }
        });

        return NextResponse.json(newRoom);
    } catch (error) {
        return NextResponse.json({ error: "Room creation failed" }, { status: 500 });
    }
}