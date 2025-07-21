import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const rooms = await prisma.room.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, slug } = await req.json();
        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newRoom = await prisma.room.create({
            data: {
                name,
                slug,
                ownerId: user.id
            }
        });

        return NextResponse.json(newRoom);
    } catch (error) {
        return NextResponse.json({ error: "Room creation failed" }, { status: 500 });
    }
}
