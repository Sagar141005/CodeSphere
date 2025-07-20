import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";


export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const team = await prisma.team.findUnique({
        where: { id },
        include: { createdBy: true }
    });

    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if(team.createdBy.id !== session.user.email) {
        return NextResponse.json({ error: "Only team owner can remove members" }, { status: 403 });
    }

    const userToRemove = await prisma.user.findUnique({ where: { email } });
    if(!userToRemove) return NextResponse.json({ error: "User not found"}, { status: 404 });

    await prisma.team.update({
        where: { id },
        data: {
            members: { disconnect: { id: userToRemove.id } }
        }
    });

    return NextResponse.json({ success: true });
}