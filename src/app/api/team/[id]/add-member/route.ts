import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const team = await prisma.team.findUnique({
        where: { id },
        include: { createdBy: true }
    });

    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.createdBy.email !== session.user.email) {
        return NextResponse.json({ error: "Forbidden: Only team owner can add members" }, { status: 403 });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updatedTeam = await prisma.team.update({
        where: { id },
        data: {
            members: { connect: { id: userToAdd.id } }
        },
        include: { members: true, rooms: true }
    });
    return NextResponse.json(updatedTeam);
}