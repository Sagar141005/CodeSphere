import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
        return NextResponse.json({ error: "Team name required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    const team = await prisma.team.create({
        data: {
            name,
            createdBy: { connect: { id: user!.id } },
            members: { connect: { id: user!.id } },
        },
        include: { members: true, rooms: true },
    });

    return NextResponse.json(team);
}
