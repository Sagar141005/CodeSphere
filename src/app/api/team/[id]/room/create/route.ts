import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const isMember = team.members.some((m) => m.email === session.user?.email);
  if (!isMember) {
    return NextResponse.json({ error: "You are not a team member" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  const room = await prisma.room.create({
    data: {
      slug: `${id}-${Date.now()}`,
      owner: { connect: { id: user?.id } },
      team: { connect: { id } },
      content: "",
    },
  });

  return NextResponse.json(room);
}
